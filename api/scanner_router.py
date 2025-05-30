import subprocess
import os
import json
import tempfile
import shutil
import sys

class ScannerRouter:
    def run_scan(self, repo_path: str, language: str):
        if language == "python":
            req_path = os.path.join(repo_path, "requirements.txt")
            if os.path.isfile(req_path):
                venv_dir = tempfile.mkdtemp(prefix="venv_")
                try:
                    subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True) # create virtual environment
                    python_bin = os.path.join(venv_dir, "bin", "python")
                    pip_bin = os.path.join(venv_dir, "bin", "pip")
                    subprocess.run([python_bin, "-m", "pip", "install", "--upgrade", "pip"], check=True)
                    subprocess.run([pip_bin, "install", "-r", req_path], check=True)
                    subprocess.run([pip_bin, "install", "pip-audit"], check=True)
                    result = subprocess.run([
                        python_bin, "-m", "pip_audit", "-r", req_path, "-f", "json"
                    ], capture_output=True, text=True)
                    if result.stdout:
                        return json.loads(result.stdout)
                    else:
                        raise RuntimeError(f"pip-audit failed: {result.stderr}")
                except subprocess.CalledProcessError as e:
                    raise RuntimeError(f"pip-audit failed: {e.stderr}")
                finally:
                    shutil.rmtree(venv_dir)
            else:
                # fallback: run pip-audit in the repo directory (audits current environment)
                # TODO: test and remove fallback
                try:
                    result = subprocess.run([
                        "pip-audit", "-f", "json"
                    ], cwd=repo_path, capture_output=True, text=True)
                    if result.stdout:
                        return json.loads(result.stdout)
                    else:
                        raise RuntimeError(f"pip-audit failed: {result.stderr}")
                except Exception as e:
                    raise RuntimeError(f"pip-audit failed: {e}")
        elif language == "nodejs":
            # Node.js support
            temp_dir = tempfile.mkdtemp(prefix="npm_audit_")
            try:
                shutil.copy(os.path.join(repo_path, "package.json"), temp_dir)
                lock_path = os.path.join(repo_path, "package-lock.json")
                if os.path.isfile(lock_path):
                    shutil.copy(lock_path, temp_dir)
                subprocess.run(["npm", "install", "--ignore-scripts"], cwd=temp_dir, check=True)
                result = subprocess.run(["npm", "audit", "--json"], cwd=temp_dir, capture_output=True, text=True)
                if result.stdout:
                    return json.loads(result.stdout)
                else:
                    raise RuntimeError(f"npm audit failed: {result.stderr}")
            except subprocess.CalledProcessError as e:
                raise RuntimeError(f"npm audit failed: {e.stderr}")
            finally:
                shutil.rmtree(temp_dir)
        else:
            raise NotImplementedError(f"Scanner for language '{language}' is not implemented yet.")
