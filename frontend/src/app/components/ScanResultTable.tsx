import React from "react";

type ScanResultTableProps = {
  result: any;
};

export default function ScanResultTable({ result }: ScanResultTableProps) {
  if (!result) return null;
  if (result.error) {
    return (
      <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4 mb-4 w-full text-center">
        <strong>Error:</strong> {result.error.message}
        <br />
        <em>Step: {result.error.step}</em>
      </div>
    );
  }
  return (
    <div className="mt-8 w-full flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 text-center">Scan Result</h2>
      <div className="mb-4 text-center">
        <strong>Language:</strong> <span className="text-gray-700">{result.language}</span>
      </div>
      <div className="w-full flex flex-col items-center justify-center">
        <strong className="text-center">Vulnerabilities:</strong>
        {result.scan_results && result.scan_results.length > 0 ? (
          <div className="overflow-x-auto mt-2 w-full flex justify-center">
            <table className="max-w-2xl w-full border border-gray-300 rounded shadow-sm bg-white text-[#202020] mx-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-center">CVE ID</th>
                  <th className="border px-3 py-2 text-center">Package</th>
                  <th className="border px-3 py-2 text-center">Severity</th>
                  <th className="border px-3 py-2 text-center">Description</th>
                  <th className="border px-3 py-2 text-center">Reference</th>
                </tr>
              </thead>
              <tbody>
                {result.scan_results.map((vuln: any, idx: number) => (
                  <tr key={idx} className="even:bg-gray-50 text-center">
                    <td className="border px-3 py-2 font-semibold text-blue-700">{vuln.cve_id}</td>
                    <td className="border px-3 py-2">{vuln.package}</td>
                    <td className={`border px-3 py-2 font-semibold ${vuln.severity === 'critical' ? 'text-red-700' : vuln.severity === 'high' ? 'text-red-500' : vuln.severity === 'moderate' ? 'text-yellow-600' : 'text-gray-700'}`}>{vuln.severity}</td>
                    <td className="border px-3 py-2 text-sm">{vuln.description}</td>
                    <td className="border px-3 py-2">
                      {vuln.references && vuln.references.length > 0 ? (
                        <a href={vuln.references[0]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Link</a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-green-700 mt-2 text-center">No vulnerabilities found.</div>
        )}
      </div>
    </div>
  );
} 