/**
 * SHAB Legal Practice Manager - License Page
 * 
 * Copyright © 2026 SHAB Legal Consultants FZC
 * All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  Building2,
  Mail,
  Phone,
  Globe,
  Download,
  Printer,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function License() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const currentYear = new Date().getFullYear();

  const licenseText = `PROPRIETARY LICENSE

SHAB Legal Practice Manager
Version 1.0.0

Copyright © ${currentYear} SHAB Legal Consultants FZC
All rights reserved.

This software is the exclusive property of SHAB Legal Consultants FZC 
and is protected by international copyright laws and treaties.

1. GRANT OF LICENSE
This software is licensed, not sold, to SHAB Legal Consultants FZC 
and its authorized personnel only. No license is granted to any 
third party.

2. RESTRICTIONS
You may not:
- Copy, modify, or create derivative works of this software
- Distribute, sublicense, or transfer this software to any third party
- Reverse engineer, decompile, or disassemble any part of this software
- Remove any copyright or proprietary notices
- Use this software for any purpose other than authorized legal practice

3. CONFIDENTIALITY
All source code, documentation, and related materials are strictly 
confidential and may not be disclosed to any unauthorized parties.

4. TERMINATION
This license is effective until terminated. It will terminate 
automatically without notice if you fail to comply with any provision. 
Upon termination, you must destroy all copies of the software.

5. DISCLAIMER
THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

6. GOVERNING LAW
This license shall be governed by and construed in accordance with 
the laws of the United Arab Emirates, without regard to its conflict 
of law provisions.

7. CONTACT
For licensing inquiries, permissions, or questions:
SHAB Legal Consultants FZC
Email: info@shablegal.com
Phone: +971 4 123 4567

© ${currentYear} SHAB Legal Consultants FZC. All rights reserved.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(licenseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>SHAB Legal Practice Manager - License</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                padding: 40px; 
                max-width: 800px; 
                margin: 0 auto;
                line-height: 1.6;
              }
              h1 { 
                color: #1a2332; 
                border-bottom: 3px solid #c9a84c;
                padding-bottom: 10px;
                text-align: center;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 20px;
              }
              .section { 
                margin: 20px 0; 
              }
              .section h2 { 
                color: #1a2332; 
                font-size: 18px;
                margin-top: 25px;
              }
              .footer { 
                margin-top: 40px; 
                padding-top: 20px;
                border-top: 2px solid #c9a84c;
                text-align: center;
                font-size: 14px;
                color: #666;
              }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SHAB Legal Practice Manager</h1>
              <p><strong>Proprietary License Agreement</strong></p>
              <p>Version 1.0.0</p>
              <p>Copyright © ${currentYear} SHAB Legal Consultants FZC</p>
              <p>All rights reserved.</p>
            </div>
            <div class="section">
              ${licenseText.split('\n').map(line => {
                if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || 
                    line.trim().startsWith('3.') || line.trim().startsWith('4.') || 
                    line.trim().startsWith('5.') || line.trim().startsWith('6.') || 
                    line.trim().startsWith('7.')) {
                  return `<h2>${line.trim()}</h2>`;
                }
                if (line.trim() === '') {
                  return '<br>';
                }
                return `<p>${line.trim()}</p>`;
              }).join('')}
            </div>
            <div class="footer">
              <p>© ${currentYear} SHAB Legal Consultants FZC. All rights reserved.</p>
              <p>www.shablegal.com | info@shablegal.com | +971 4 123 4567</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#1a2332] flex items-center justify-center">
          <Scale className="w-6 h-6 text-[#c9a84c]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">License Agreement</h1>
          <p className="text-sm text-gray-500">SHAB Legal Practice Manager</p>
        </div>
      </div>

      {/* License Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#c9a84c]" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Proprietary</p>
                <p className="text-xs text-gray-500">All rights reserved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-[#c9a84c]" />
              <div>
                <p className="text-sm font-semibold text-gray-900">SHAB Legal</p>
                <p className="text-xs text-gray-500">Consultants FZC</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-[#c9a84c]" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Version 1.0.0</p>
                <p className="text-xs text-gray-500">© {currentYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={handleCopy} variant="outline" size="sm">
          {copied ? '✓ Copied!' : <><Copy className="w-4 h-4 mr-1" /> Copy</>}
        </Button>
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-1" /> Print
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
          Back to Settings
        </Button>
      </div>

      {/* License Text */}
      <Card className="border-2 border-[#c9a84c]/20">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-[#1a2332]">
            SHAB Legal Practice Manager
          </CardTitle>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Proprietary License Agreement</p>
            <p className="text-xs text-gray-500">Version 1.0.0</p>
            <p className="text-xs text-gray-500">Copyright © {currentYear} SHAB Legal Consultants FZC</p>
            <p className="text-xs text-gray-500 font-semibold">All rights reserved.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap font-mono text-xs md:text-sm leading-relaxed">
            {licenseText}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mt-6 border-l-4 border-l-[#c9a84c]">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#c9a84c]" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">info@shablegal.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#c9a84c]" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">+971 4 123 4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-[#c9a84c]" />
              <div>
                <p className="text-xs text-gray-500">Website</p>
                <p className="font-medium">www.shablegal.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">CONFIDENTIAL AND PROPRIETARY</p>
          <p className="text-xs text-red-600 mt-1">
            This software is the exclusive property of SHAB Legal Consultants FZC. 
            Unauthorized copying, distribution, or use is strictly prohibited and 
            may result in civil and criminal penalties.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-[10px] text-gray-400 border-t border-gray-200 pt-4">
        <p>© {currentYear} SHAB Legal Consultants FZC. All rights reserved.</p>
        <p className="mt-1">SHAB Legal Practice Manager v1.0.0</p>
      </div>
    </div>
  );
}
