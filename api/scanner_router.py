# Patchly - Detects security issues in GitHub repos.
# Copyright (C) 2025  Rawsab Said
# This file is part of Patchly and is licensed under the
# GNU General Public License v3.0. See LICENSE for details.

import subprocess
import os
import json
import tempfile
import shutil
import sys
from glob import glob

class ScannerRouter:
    def run_scan(self, repo_path: str, language: str):
        if language == "python":
            req_path = os.path.join(repo_path, "requirements.txt")
            if os.path.isfile(req_path):
                venv_dir = tempfile.mkdtemp(prefix="venv_")
                try:
                    try:
                        subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True, capture_output=True, text=True)
                    except Exception as e:
                        raise RuntimeError(f"Failed to create virtualenv: {e}")
                    python_bin = os.path.join(venv_dir, "bin", "python")
                    pip_bin = os.path.join(venv_dir, "bin", "pip")
                    try:
                        subprocess.run([python_bin, "-m", "pip", "install", "--upgrade", "pip"], check=True, capture_output=True, text=True)
                        subprocess.run([pip_bin, "install", "-r", req_path], check=True, capture_output=True, text=True)
                    except subprocess.CalledProcessError as e:
                        raise RuntimeError(f"Dependency install failed: {e.stderr}")
                    
                    # Ensure pip-audit and web scraping dependencies are installed in the scan venv
                    subprocess.run([pip_bin, "install", "pip-audit", "requests", "beautifulsoup4"], check=True, capture_output=True, text=True)
                    audit_bin = os.path.join(venv_dir, "bin", "pip-audit")
                    if not os.path.isfile(audit_bin):
                        raise RuntimeError("pip-audit is not installed in the virtual environment.")
                    
                    try:
                        result = subprocess.run([
                            audit_bin, "-r", req_path, "-f", "json"
                        ], capture_output=True, text=True)
                        if result.returncode != 0 and not result.stdout:
                            raise RuntimeError(f"pip-audit failed: {result.stderr}")
                        if result.stdout:
                            return json.loads(result.stdout)
                        else:
                            raise RuntimeError(f"pip-audit returned no output: {result.stderr}")
                    except subprocess.CalledProcessError as e:
                        raise RuntimeError(f"pip-audit failed: {e.stderr}")
                    except json.JSONDecodeError:
                        raise RuntimeError("pip-audit did not return valid JSON output.")
                finally:
                    shutil.rmtree(venv_dir, ignore_errors=True)
            else:
                # Fallback: run pip-audit in the repo directory (audits current environment)
                try:
                    result = subprocess.run([
                        "pip-audit", "-f", "json"
                    ], cwd=repo_path, capture_output=True, text=True)
                    if result.returncode != 0 and not result.stdout:
                        raise RuntimeError(f"pip-audit failed: {result.stderr}")
                    if result.stdout:
                        return json.loads(result.stdout)
                    else:
                        raise RuntimeError(f"pip-audit returned no output: {result.stderr}")
                except FileNotFoundError:
                    raise RuntimeError("pip-audit is not installed or not found in PATH.")
                except subprocess.CalledProcessError as e:
                    raise RuntimeError(f"pip-audit failed: {e.stderr}")
                except json.JSONDecodeError:
                    raise RuntimeError("pip-audit did not return valid JSON output.")
        elif language == "nodejs":
            pkg_json = os.path.join(repo_path, "package.json")
            if not os.path.isfile(pkg_json):
                raise FileNotFoundError("package.json not found in repo.")
            try:
                try:
                    subprocess.run(["npm", "install", "--ignore-scripts"], cwd=repo_path, check=True, capture_output=True, text=True)
                except subprocess.CalledProcessError as e:
                    raise RuntimeError(f"npm install failed: {e.stderr}")
                try:
                    result = subprocess.run([
                        "npm", "audit", "--json"
                    ], cwd=repo_path, capture_output=True, text=True, check=True)
                    return json.loads(result.stdout)
                except subprocess.CalledProcessError as e:
                    if e.stdout:
                        try:
                            return json.loads(e.stdout)
                        except json.JSONDecodeError:
                            raise RuntimeError(f"npm audit failed and did not return valid JSON: {e.stderr}")
                    raise RuntimeError(f"npm audit failed: {e.stderr}")
                except json.JSONDecodeError:
                    raise RuntimeError("npm audit did not return valid JSON output.")
            finally:
                # No temp dir to clean for Node.js, but placeholder for future
                pass
        else:
            # OSV-Scanner fallback for all other languages
            # Supported lockfiles/manifests (now includes .NET, Go, Java, Ruby, PHP, Dart, etc.)
            manifest_patterns = [
                "**/go.mod", "**/go.sum", # Go
                "**/pom.xml", "**/build.gradle", "**/build.gradle.kts", "**/settings.gradle", "**/settings.gradle.kts", # Java/Kotlin
                "**/Cargo.lock", # Rust
                "**/Gemfile.lock", # Ruby
                "**/composer.lock", # PHP
                "**/pubspec.lock", # Dart
                "**/Pipfile.lock", "**/poetry.lock", # Python (extra)
                "**/yarn.lock", "**/pnpm-lock.yaml", "**/package-lock.json", # Node.js (extra)
                "**/*.csproj", "**/*.fsproj", "**/*.vbproj", "**/packages.config", # .NET
                "**/mix.lock", # Elixir
                "**/shard.lock", # Crystal
                "**/conan.lock", # C/C++ Conan
                "**/requirements.txt" # Python (extra)
            ]
            found_files = []
            for pattern in manifest_patterns:
                found_files.extend(glob(os.path.join(repo_path, pattern), recursive=True))
            if not found_files:
                raise NotImplementedError("No supported manifest/lockfiles found for OSV-Scanner.")
            try:
                # Run osv-scanner on all found files
                result = subprocess.run([
                    "osv-scanner", "--format", "json", *[f for file in found_files for f in ("--lockfile", file)]
                ], capture_output=True, text=True, check=True)
                return json.loads(result.stdout)
            except FileNotFoundError:
                raise RuntimeError("osv-scanner is not installed or not found in PATH.")
            except subprocess.CalledProcessError as e:
                if e.stdout:
                    return json.loads(e.stdout)
                raise RuntimeError(f"osv-scanner failed: {e.stderr}")
            except json.JSONDecodeError:
                raise RuntimeError("osv-scanner did not return valid JSON output.")
