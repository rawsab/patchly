import json
import re
import requests

class CVEParser:
    def __init__(self):
        self.pypi_advisory_url = "https://pypi.org/pypi/{}/json"

    def get_pypi_advisory_link(self, pkg_name: str, pysec_id: str) -> str:
        """Get the PyPI advisory link for a PYSEC ID."""
        try:
            # Extract the year and number from PYSEC ID (e.g., PYSEC-2019-13 -> 2019, 13)
            match = re.match(r'PYSEC-(\d{4})-(\d+)', pysec_id)
            if not match:
                return None
            
            year, number = match.groups()
            # PyPI advisory URLs follow this format
            return f"https://github.com/pypa/advisory-database/blob/main/vulns/{pkg_name}/{year}/{pysec_id}.md"
        except Exception:
            return None

    def normalize(self, scanner_output):
        # handle pip-audit output
        if isinstance(scanner_output, dict) and "dependencies" in scanner_output:
            packages = scanner_output["dependencies"]
            normalized = []
            for pkg in packages:
                name = pkg.get("name")
                version = pkg.get("version")
                for vuln in pkg.get("vulns", []):
                    cve_id = vuln.get("id")
                    references = vuln.get("references", [])
                    
                    # Add CIRCL CVE database link for Python vulnerabilities
                    if cve_id:
                        if cve_id.startswith("PYSEC-"):
                            # Convert PYSEC ID to lowercase for the URL
                            cve_lower = cve_id.lower()
                            references.append(f"https://cvepremium.circl.lu/vuln/{cve_lower}")
                        elif cve_id.startswith("CVE-"):
                            references.append(f"https://cvepremium.circl.lu/vuln/{cve_id}")
                    
                    normalized.append({
                        "cve_id": cve_id,
                        "package": name,
                        "version": version,
                        "severity": vuln.get("severity", "UNKNOWN"),
                        "description": vuln.get("description", ""),
                        "references": references,
                        "aliases": vuln.get("aliases", []),
                        "fix_versions": vuln.get("fix_versions", [])
                    })
            return normalized
        # handle npm audit output
        elif isinstance(scanner_output, dict) and "vulnerabilities" in scanner_output:
            vulns = scanner_output["vulnerabilities"]
            normalized = []
            for pkg_name, vuln_info in vulns.items():
                version = None
                if "nodes" in vuln_info and vuln_info["nodes"]:
                    # try to extract version from node_modules path if possible
                    # (not always available)
                    version = None
                via = vuln_info.get("via", [])
                if isinstance(via, dict):
                    via = [via]
                for v in via:
                    if isinstance(v, dict):
                        normalized.append({
                            "cve_id": v.get("source", v.get("title", "")),
                            "package": pkg_name,
                            "version": version,
                            "severity": v.get("severity", vuln_info.get("severity", "UNKNOWN")),
                            "description": v.get("title", v.get("name", "")),
                            "references": [v.get("url")] if v.get("url") else [],
                            "aliases": [],
                            "fix_versions": [v.get("fixAvailable", {}).get("version")] if isinstance(v.get("fixAvailable"), dict) and v.get("fixAvailable", {}).get("version") else []
                        })
            return normalized
        # handle old pip-audit output (list)
        elif isinstance(scanner_output, list):
            packages = scanner_output
            normalized = []
            for pkg in packages:
                name = pkg.get("name")
                version = pkg.get("version")
                for vuln in pkg.get("vulns", []):
                    cve_id = vuln.get("id")
                    references = vuln.get("references", [])
                    
                    # Add PYSEC advisory link if it's a PYSEC ID
                    if cve_id and cve_id.startswith("PYSEC-"):
                        pysec_link = self.get_pypi_advisory_link(name, cve_id)
                        if pysec_link:
                            references.append(pysec_link)
                    
                    normalized.append({
                        "cve_id": cve_id,
                        "package": name,
                        "version": version,
                        "severity": vuln.get("severity", "UNKNOWN"),
                        "description": vuln.get("description", ""),
                        "references": references,
                        "aliases": vuln.get("aliases", []),
                        "fix_versions": vuln.get("fix_versions", [])
                    })
            return normalized
        else:
            return []
