import json
import re
import requests
from bs4 import BeautifulSoup
from typing import Optional

class CVEParser:
    def __init__(self):
        self.pypi_advisory_url = "https://pypi.org/pypi/{}/json"
        self.severity_keywords = {
            'critical': ['critical', 'critical severity', 'cvss:3.0/av:n/ac:l/pr:n/ui:n/s:u/c:h/i:h/a:h'],
            'high': ['high', 'high severity', 'cvss:3.0/av:n/ac:l/pr:n/ui:n/s:u/c:h/i:h/a:l'],
            'medium': ['medium', 'medium severity', 'moderate', 'moderate severity', 'cvss:3.0/av:n/ac:l/pr:n/ui:n/s:u/c:h/i:l/a:n'],
            'low': ['low', 'low severity', 'cvss:3.0/av:n/ac:l/pr:n/ui:n/s:u/c:l/i:l/a:n']
        }

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

    def get_severity_from_circl(self, cve_id: str) -> Optional[str]:
        """Scrape severity information from CIRCL's CVE database."""
        try:
            # Convert PYSEC ID to lowercase for the URL
            cve_lower = cve_id.lower()
            url = f"https://cvepremium.circl.lu/vuln/{cve_lower}"
            
            # Add headers to mimic a browser request
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code != 200:
                return None

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for severity information in the page content
            page_text = soup.get_text().lower()
            
            # Check for severity keywords
            for severity, keywords in self.severity_keywords.items():
                if any(keyword in page_text for keyword in keywords):
                    return severity
            
            return None
        except Exception as e:
            print(f"Error scraping CIRCL for {cve_id}: {str(e)}")
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
                            
                            # Try to get severity from CIRCL
                            circl_severity = self.get_severity_from_circl(cve_id)
                            if circl_severity:
                                vuln["severity"] = circl_severity
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
