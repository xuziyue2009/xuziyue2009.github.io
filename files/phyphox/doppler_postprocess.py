# -*- coding: utf-8 -*-
"""
Phyphox 多普勒测速实验 —— 数据后处理脚本
==========================================

配套实验文件: doppler-speed.phyphox
（Phyphox「多普勒效应」实验改造版：声源静止放 1000 Hz 正弦声，
  手机作为接收端移动，靠窄带自相关测频 -> v = c(1 - f0/f)）

功能
----
1. 读取 Phyphox 导出的 zip（内含 Raw acceleration.csv 与
   Doppler (frequency and speed).csv），也支持直接读两个 csv；
2. 对加速度做梯形积分得到速度，并给出三档精度递进的处理：
      A. 纯积分                （基线，漂移最严重）
      B. 滑动平均滤波 + 首尾零偏扣除
      C. 在 B 基础上叠加 ZUPT  （静止区间速度归零，漂移最小）
3. 用多普勒实测速度作为独立参考，做方向对齐与阶段划分；
4. 输出对比图与可引用的数据表（UTF-8 BOM，Excel 直接打开）。

依赖: numpy, matplotlib
用法:
    python doppler_postprocess.py --zip 导出数据.zip --outdir out
    python doppler_postprocess.py --acc "Raw acceleration.csv" \
                                  --dop "Doppler (frequency and speed).csv" --outdir out

作者: 子越   协议: MIT
"""

import argparse
import csv
import io
import os
import sys
import zipfile

import numpy as np

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

# ---- 实验常量 --------------------------------------------------------------
SOUND_SPEED = 340.0      # 声速 m/s（对应约 15 ℃ 空气，Phyphox 默认）
MAIN_AXIS = "ay"         # 主运动轴（由手机放置姿态决定，可改）


# ---- 数据载入 --------------------------------------------------------------
def _read_csv_text(text):
    """把一段 CSV 文本解析为 (header, ndarray)，自动跳过 NaN 与非法行。"""
    lines = [l for l in text.replace("\r\n", "\n").split("\n") if l.strip()]
    if not lines:
        raise ValueError("CSV 内容为空")
    header = [h.strip().strip('"') for h in lines[0].split(",")]
    rows = []
    for line in lines[1:]:
        try:
            vals = [float(x) for x in line.split(",")]
        except ValueError:
            continue
        if any(np.isnan(v) for v in vals):
            continue
        rows.append(vals)
    if not rows:
        raise ValueError("CSV 无有效数据行")
    return header, np.array(rows)


def load_from_zip(path):
    """从 Phyphox 导出的 zip 里取出加速度与多普勒两个 csv。"""
    with zipfile.ZipFile(path) as z:
        names = z.namelist()

        def pick(keywords):
            for n in names:
                low = n.lower()
                if all(k in low for k in keywords):
                    return n
            return None

        acc_name = pick(["raw acceleration"])
        dop_name = pick(["doppler"])
        if acc_name is None or dop_name is None:
            raise ValueError(
                "zip 中未找到所需文件，实际包含: %s" % ", ".join(names)
            )
        acc_text = z.read(acc_name).decode("utf-8-sig", errors="replace")
        dop_text = z.read(dop_name).decode("utf-8-sig", errors="replace")
    return _read_csv_text(acc_text), _read_csv_text(dop_text)


def load_from_files(acc_path, dop_path):
    with open(acc_path, "r", encoding="utf-8-sig", errors="replace") as f:
        acc = _read_csv_text(f.read())
    with open(dop_path, "r", encoding="utf-8-sig", errors="replace") as f:
        dop = _read_csv_text(f.read())
    return acc, dop


# ---- 信号处理 --------------------------------------------------------------
def trapezoid_integrate(t, a):
    """梯形法积分；对异常 dt（<=0 或 >0.5s）用中位采样间隔兜底。"""
    v = np.zeros_like(a, dtype=float)
    dt_med = float(np.median(np.diff(t))) if len(t) > 1 else 0.0
    for i in range(1, len(a)):
        dt = t[i] - t[i - 1]
        if dt <= 0 or dt > 0.5:
            dt = dt_med
        v[i] = v[i - 1] + 0.5 * (a[i] + a[i - 1]) * dt
    return v


def moving_average(x, w=10):
    if len(x) < w:
        return x.astype(float).copy()
    return np.convolve(x, np.ones(w) / w, mode="same")


def endpoint_bias(a, t, sec=1.5):
    """取首尾各 sec 秒的均值作为静止零偏估计。"""
    m = (t <= t[0] + sec) | (t >= t[-1] - sec)
    return float(a[m].mean()) if m.any() else float(a.mean())


def static_mask(a, t, thresh=0.08, wsec=0.3):
    """滑动窗口标准差小于阈值 => 判为静止区间（用于 ZUPT）。"""
    n = len(a)
    if n < 3:
        return np.zeros(n, bool)
    dt = float(np.median(np.diff(t)))
    w = max(3, int(wsec / dt)) if dt > 0 else 3
    st = np.zeros(n, bool)
    for i in range(n):
        lo, hi = max(0, i - w // 2), min(n, i + w // 2 + 1)
        if hi - lo >= 3 and np.std(a[lo:hi]) < thresh:
            st[i] = True
    return st


def process_axis(t, a):
    """返回该轴三档速度：(v_raw, v_filtered, v_zupt) 与零偏值 b。"""
    v_raw = trapezoid_integrate(t, a)
    a_sm = moving_average(a, 10)
    b = endpoint_bias(a_sm, t)
    v_f = trapezoid_integrate(t, a_sm - b)
    st = static_mask(a_sm, t)
    v_z = v_f.copy()
    v_z[st] = 0.0
    return (v_raw, v_f, v_z), b, st


def doppler_stage_table(td, vd, step=1.5, tol=0.08):
    """把多普勒速度按固定时间窗聚合，给出运动阶段描述。"""
    stages = []
    s = 0.5
    while s + step <= td[-1] + 1e-9:
        m = (td >= s) & (td < s + step)
        if m.sum() >= 3:
            mv = float(vd[m].mean())
            if mv > tol:
                state = "靠近声源"
            elif mv < -tol:
                state = "远离声源"
            else:
                state = "近似静止/过渡"
            stages.append((s, s + step, mv, state))
        s += step
    return stages


# ---- 输出 ------------------------------------------------------------------
def write_csv(path, header, rows):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Phyphox 多普勒测速实验数据后处理"
    )
    ap.add_argument("--zip", help="Phyphox 导出的 zip 文件")
    ap.add_argument("--acc", help="Raw acceleration.csv 路径（与 --zip 二选一）")
    ap.add_argument("--dop", help="Doppler (frequency and speed).csv 路径")
    ap.add_argument("--outdir", default="out", help="输出目录（默认 out）")
    ap.add_argument("--axis", default=MAIN_AXIS,
                    choices=["ax", "ay", "az"], help="主运动轴（默认 ay）")
    args = ap.parse_args(argv)

    if args.zip:
        (hacc, A), (hdop, D) = load_from_zip(args.zip)
    elif args.acc and args.dop:
        (hacc, A), (hdop, D) = load_from_files(args.acc, args.dop)
    else:
        ap.error("请提供 --zip 或同时提供 --acc 与 --dop")

    os.makedirs(args.outdir, exist_ok=True)

    # 定位列（Phyphox 表头: "Time (s)", "ax (m/s^2)" ...）
    def col(header, key):
        for i, h in enumerate(header):
            if key in h.lower():
                return i
        raise KeyError("未找到列 %s，实际表头: %s" % (key, header))

    t = A[:, col(hacc, "time")]
    acc = {ax: A[:, col(hacc, "%s (m/s" % ax)] for ax in ("ax", "ay", "az")}
    td = D[:, col(hdop, "time")]
    vd = D[:, col(hdop, "speed")]

    print("加速度 %d 点, %.2f~%.2f s" % (len(t), t[0], t[-1]))
    print("多普勒 %d 点, %.2f~%.2f s" % (len(td), td[0], td[-1]))

    # 三档处理（对全部轴算，主图只展示主运动轴）
    per_axis = {}
    for nm in ("ax", "ay", "az"):
        vs, b, st = process_axis(t, acc[nm])
        per_axis[nm] = vs
        print("  %s: 纯积分末速 %+.3f | 零偏修正 %+.3f (b=%+.4f) | ZUPT %+.3f"
              % (nm, vs[0][-1], vs[1][-1], b, vs[2][-1]))

    v_raw, v_f, v_z = per_axis[args.axis]

    # ---- 数据表 ----
    ay_sm = moving_average(acc[args.axis], 10)
    rows = [[round(float(t[i]), 3), round(float(ay_sm[i]), 4),
             round(float(v_raw[i]), 4), round(float(v_f[i]), 4),
             round(float(v_z[i]), 4)]
            for i in range(0, len(t), 10)]
    p1 = os.path.join(args.outdir, "表1_加速度积分速度_三档对比.csv")
    write_csv(p1, ["时间(s)", "%s加速度(m/s^2)" % args.axis,
                   "A_纯积分速度(m/s)", "B_滤波+零偏速度(m/s)",
                   "C_ZUPT速度(m/s)"], rows)

    rows = [[round(float(td[i]), 3), "", round(float(vd[i]), 4)]
            for i in range(0, len(td), 3)]
    p2 = os.path.join(args.outdir, "表2_多普勒测速数据.csv")
    write_csv(p2, ["时间(s)", "速度(m/s)", ""], [[r[0], r[2]] for r in rows])

    stages = doppler_stage_table(td, vd)
    p3 = os.path.join(args.outdir, "表3_多普勒运动阶段分析.csv")
    write_csv(p3, ["时间段(s)", "平均速度(m/s)", "运动状态"],
              [["%.1f~%.1f" % (a, b), round(mv, 4), st] for a, b, mv, st in stages])

    # ---- 对比图 ----
    fig, axes = plt.subplots(3, 1, figsize=(12, 10))

    axes[0].plot(t, acc["ax"], lw=0.8, alpha=0.5, color="gray", label="ax")
    axes[0].plot(t, acc[args.axis], lw=1.2, color="tab:blue",
                 label="%s（主运动轴）" % args.axis)
    axes[0].plot(t, acc["az"], lw=0.8, alpha=0.5, color="tab:green", label="az")
    axes[0].set_ylabel("加速度 (m/s²)")
    axes[0].set_title("(a) 三轴加速度时程")
    axes[0].legend(fontsize=9, ncol=3)
    axes[0].grid(alpha=0.3)

    axes[1].plot(t, v_raw, color="gray", lw=1, alpha=0.85,
                 label="A. 纯积分（末速%+.3f）" % v_raw[-1])
    axes[1].plot(t, v_f, color="tab:blue", lw=1.6,
                 label="B. 滤波+零偏（末速%+.3f）" % v_f[-1])
    axes[1].plot(t, v_z, color="tab:red", lw=1.6, ls="--",
                 label="C. ZUPT（末速%+.3f）" % v_z[-1])
    axes[1].axhline(0, color="k", lw=0.6, ls=":")
    axes[1].set_ylabel("速度 (m/s)")
    axes[1].set_title("(b) %s 轴加速度积分速度：三种处理对比（静止时应归零）" % args.axis)
    axes[1].legend(fontsize=9)
    axes[1].grid(alpha=0.3)

    axes[2].plot(td, vd, color="tab:orange", lw=1.8)
    axes[2].axhline(0, color="k", lw=0.6, ls=":")
    axes[2].fill_between(td, 0, vd, where=(vd > 0), color="tab:red",
                         alpha=0.18, label="靠近声源")
    axes[2].fill_between(td, 0, vd, where=(vd < 0), color="tab:blue",
                         alpha=0.18, label="远离声源")
    axes[2].set_ylabel("速度 (m/s)")
    axes[2].set_xlabel("时间 (s)")
    axes[2].set_title("(c) 多普勒效应测速结果（声学法，参考值）")
    axes[2].legend(fontsize=9)
    axes[2].grid(alpha=0.3)

    plt.tight_layout()
    p4 = os.path.join(args.outdir, "图_综合分析.png")
    plt.savefig(p4, dpi=150)
    plt.close(fig)

    print("\n[完成] 输出目录:", os.path.abspath(args.outdir))
    for p in (p1, p2, p3, p4):
        print("  %s  %.1f KB" % (os.path.basename(p), os.path.getsize(p) / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
