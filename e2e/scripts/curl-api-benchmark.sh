#!/usr/bin/env bash
# Measure API round-trip times with curl (avoids rate-limit bursts)
set -euo pipefail

EMAIL="${E2E_DOCTOR_EMAIL:-shresthjindal28@gmail.com}"
PASSWORD="${E2E_DOCTOR_PASSWORD:-AiroLocalDev123!}"
BASE="http://127.0.0.1:8000/api/v1"
SAMPLES=10
OUT="/Users/shresthjindal/Desktop/airo/frontend/e2e-artifacts/login-latency/curl-timings.json"

mkdir -p "$(dirname "$OUT")"

python3 - "$OUT" "$SAMPLES" "$EMAIL" "$PASSWORD" "$BASE" <<'PY'
import json, subprocess, sys, statistics, time

out, samples, email, password, base = sys.argv[1:6]
samples = int(samples)

def curl_ms(method, url, headers=None, data=None):
    args = ["curl", "-s", "-o", "/dev/null", "-w", "%{time_total}", "-X", method]
    for k, v in (headers or {}).items():
        args += ["-H", f"{k}: {v}"]
    if data:
        args += ["-H", "Content-Type: application/json", "-d", data]
    args.append(url)
    r = subprocess.run(args, capture_output=True, text=True, check=True)
    return float(r.stdout.strip()) * 1000

def pct(vals, p):
    s = sorted(vals)
    return s[int(p * (len(s)-1))] if s else 0

results = {}

# Login
login_ms = []
token = None
for i in range(samples):
    t0 = time.perf_counter()
    proc = subprocess.run(
        ["curl", "-s", "-X", "POST", f"{base}/doctors/login",
         "-H", "Content-Type: application/json",
         "-d", json.dumps({"email": email, "password": password}),
         "-w", "\n%{time_total}"],
        capture_output=True, text=True, check=True,
    )
    lines = proc.stdout.strip().split("\n")
    body = "\n".join(lines[:-1])
    ms = float(lines[-1]) * 1000
    login_ms.append(ms)
    if i == 0:
        token = json.loads(body)["access_token"]
    time.sleep(6.5)  # respect 10/min login rate limit

results["POST /doctors/login"] = {
    "p50": pct(login_ms, 0.5), "p95": pct(login_ms, 0.95), "p99": pct(login_ms, 0.99),
    "mean": statistics.mean(login_ms), "samples_ms": login_ms,
}

headers = {"Authorization": f"Bearer {token}"}
for path in ["/doctors/me", "/doctors/me/onboarding-status", "/patients", "/consultations"]:
    vals = []
    for _ in range(samples):
        vals.append(curl_ms("GET", f"{base}{path}", headers=headers))
        time.sleep(0.2)
    results[f"GET {path}"] = {
        "p50": pct(vals, 0.5), "p95": pct(vals, 0.95), "p99": pct(vals, 0.99),
        "mean": statistics.mean(vals), "samples_ms": vals,
    }

# Refresh token (get from login)
proc = subprocess.run(
    ["curl", "-s", "-X", "POST", f"{base}/doctors/login",
     "-H", "Content-Type: application/json",
     "-d", json.dumps({"email": email, "password": password})],
    capture_output=True, text=True, check=True,
)
refresh = json.loads(proc.stdout)["refresh_token"]
time.sleep(6.5)
refresh_ms = []
for _ in range(min(5, samples)):
    refresh_ms.append(curl_ms("POST", f"{base}/doctors/refresh", data=json.dumps({"refresh_token": refresh})))
    time.sleep(6.5)
results["POST /doctors/refresh"] = {
    "p50": pct(refresh_ms, 0.5), "p95": pct(refresh_ms, 0.95), "p99": pct(refresh_ms, 0.99),
    "mean": statistics.mean(refresh_ms), "samples_ms": refresh_ms,
}

with open(out, "w") as f:
    json.dump(results, f, indent=2)

for k, v in results.items():
    print(f"{k}: p50={v['p50']:.0f}ms p95={v['p95']:.0f}ms mean={v['mean']:.0f}ms")
PY
