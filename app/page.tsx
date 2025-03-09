"use client"

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Download, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image';

interface QuotationItem {
  id: number
  itemName: string
  size: string
  box: number
  sqft: number | null
  rate: number
  total: number
  remarks: string
}

// Move PDF_OPTIONS inside the component to use dynamic date
const PDFTemplate = React.forwardRef<HTMLDivElement, {
  items: QuotationItem[]
  clientDetails: { name: string; phone: string }
  calculateTotal: () => number
}>(({ items, clientDetails, calculateTotal }, ref) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formattedDate = format(new Date(), "EEEE, MMMM d, yyyy")
  
  const pdfStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .quote-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      // box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header {
      position: relative;
      margin-bottom: 3rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .header-image {
      width: 100%;
      max-height: 120px;
      object-fit: contain;
      margin-bottom: 1.5rem;
    }

    .header h1 {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .date {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .content {
      display: grid;
      grid-template-columns: 1fr;
      margin-bottom: 2rem;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .info-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      align-items: center;
      width: 100%;
    }

    .info-label {
      color: #666;
      font-size: 0.9rem;
      font-weight: bold;
    }

    .info-value {
      color: #333;
      width: 100%;
    }

    .contact-info .info-row {
      margin-bottom: 1rem;
    }

    .address-info .info-row:first-child {
      align-items: start;
    }

    .main-section {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .quote-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 8px;
      margin-bottom: 2rem;
      font-size: 0.8rem;
    }

    .quote-table th, .quote-table td {
      padding: 0.5rem;
      text-align: left;
      background: #f0f4fa;
      border: 4px solid #f0f4fa;
      min-height: 2rem;
    }

    .quote-table tbody tr {
      min-height: 2rem;
    }

    .quote-table th {
      background: #f0f4fa;
      font-weight: bold;
      font-size: 0.85rem;
    }

    .quote-table th:first-child + th,
    .quote-table th:first-child + th + th {
      border-top: 4px solid #f0f4fa;
      border-left: 4px solid #f0f4fa;
    }

    .quote-table td:first-child {
      background: #f0f43fa;
    }

    .totals {
      width: 100%;
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-bottom: 2rem;
    }

    .total-row {
      padding: 0.5rem 0;
      font-size: 1rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      width: 300px;
    }

    .total-row-name {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .conditions {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 0.9rem;
    }

    .conditions strong {
      font-weight: bold;
      margin-bottom: 1rem;
      display: block;
    }

    .conditions ul {
      list-style: none;
      padding-left: 1.5rem;
    }

    .conditions li {
      position: relative;
      margin-bottom: 0.25rem;
      line-height: 1.2;
    }

    .conditions li:before {
      content: "•";
      position: absolute;
      left: -1.5rem;
      color: #666;
    }
  `

  if (!mounted) {
    return null // Prevent server-side rendering
  }

  return (
    <div style={{ display: 'none' }}>
      <style>{pdfStyles}</style>
      <div ref={ref} style={{ width: '210mm', paddingLeft: '2rem', paddingRight: '2rem'  }}>
        <div className="quote-container">
          <div className="header">
             <img src="/header-logo.png" alt="Our Own Marble House" style={{width: "100%", height: "auto", objectFit: "contain", marginBottom: "1.5rem"}} className="header-image"/>
            <h1>Proforma Invoice</h1>
            <div className="date">{formattedDate}</div>
          </div>
          <div className="content">
            <div className="contact-info">
              <div className="info-row">
                <span className="info-label">Client Name:</span>
                <span className="info-value">{clientDetails.name || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Contact Number:</span>
                <span className="info-value">{clientDetails.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="main-section">
            <table className="quote-table">
                <thead>
                    <tr>
                        <th>SR.</th>
                        <th>Item Name</th>
                        <th>Size</th>
                        <th>Box</th>
                        <th>Area (sqft)</th>
                        <th>Rate</th>
                        <th>Total</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.itemName}</td>
                    <td>{item.size}</td>
                    <td>{item.box}</td>
                    <td>{item.sqft ?? "N/A"}</td>
                    <td>{item.rate}</td>
                    <td>{item.total.toFixed(2)}</td>
                    <td>{item.remarks || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="totals">
              <div className="total-row">
                <span className="total-row-name">Total Cost</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="conditions">
            <strong>Terms and Conditions:</strong>
            <ul>
              <li>All prices are inclusive of taxes</li>
              <li>Payment terms: 50% advance, remaining before delivery</li>
              <li>Delivery within 2-3 weeks from confirmation</li>
              <li>Prices valid for 30 days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
})

PDFTemplate.displayName = 'PDFTemplate'

// Constants
const INITIAL_ITEM_STATE = {
  itemName: "",
  size: "",
  box: "",
  sqft: "",
  rate: "",
  remarks: "",
}

// Extracted Table Component
const QuotationTable: React.FC<{
  items: QuotationItem[]
  onRemoveItem: (id: number) => void
}> = React.memo(({ items, onRemoveItem }) => (
  <div className="mt-6 rounded-md border border-[#12325f]/20">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-[#12325f]/5">
          <TableHead className="text-[#12325f]">Item Name</TableHead>
          <TableHead className="text-[#12325f]">Size</TableHead>
          <TableHead className="text-[#12325f]">Box</TableHead>
          <TableHead className="text-[#12325f]">Sq ft</TableHead>
          <TableHead className="text-[#12325f]">Rate</TableHead>
          <TableHead className="text-[#12325f]">Total</TableHead>
          <TableHead className="text-[#12325f]">Remarks</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, _index) => (
          <TableRow key={item.id} className="hover:bg-[#12325f]/5">
            <TableCell>{item.itemName}</TableCell>
            <TableCell>{item.size}</TableCell>
            <TableCell>{item.box}</TableCell>
            <TableCell>{item.sqft ?? "N/A"}</TableCell>
            <TableCell>{item.rate}</TableCell>
            <TableCell>{item.total.toFixed(2)}</TableCell>
            <TableCell>{item.remarks || "N/A"}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveItem(item.id)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
))

QuotationTable.displayName = 'QuotationTable'

// Extracted Form Component
const ItemForm: React.FC<{
  currentItem: typeof INITIAL_ITEM_STATE
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
}> = React.memo(({ currentItem, onInputChange, onSubmit }) => (
  <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 md:grid-cols-6">
    <div className="space-y-2">
      <Label htmlFor="itemName" className="text-[#12325f]">Item Name</Label>
      <Input
        id="itemName"
        name="itemName"
        value={currentItem.itemName}
        onChange={onInputChange}
        required
        className="border-[#12325f]/20 focus-visible:ring-[#12325f]"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="size" className="text-[#12325f]">Size</Label>
      <Input
        id="size"
        name="size"
        value={currentItem.size}
        onChange={onInputChange}
        required
        className="border-[#12325f]/20 focus-visible:ring-[#12325f]"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="box" className="text-[#12325f]">Box</Label>
      <Input
        id="box"
        name="box"
        type="number"
        value={currentItem.box}
        onChange={onInputChange}
        required
        className="border-[#12325f]/20 focus-visible:ring-[#12325f]"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="sqft" className="text-[#12325f]">Sq ft</Label>
      <Input
        id="sqft"
        name="sqft"
        type="number"
        value={currentItem.sqft}
        onChange={onInputChange}
        className="border-[#12325f]/20 focus-visible:ring-[#12325f]"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="rate" className="text-[#12325f]">Rate</Label>
      <Input
        id="rate"
        name="rate"
        type="number"
        value={currentItem.rate}
        onChange={onInputChange}
        required
        className="border-[#12325f]/20 focus-visible:ring-[#12325f]"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="remarks" className="text-[#12325f]">Remarks</Label>
      <Textarea
        id="remarks"
        name="remarks"
        value={currentItem.remarks}
        onChange={onInputChange}
        className="border-[#12325f]/20 focus-visible:ring-[#12325f]"
        rows={1}
      />
    </div>
    <Button type="submit" className="col-span-2 md:col-span-6 bg-[#12325f] hover:bg-[#12325f]/90">
      Add Item
    </Button>
  </form>
))

ItemForm.displayName = 'ItemForm'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<QuotationItem[]>([])
  const [currentItem, setCurrentItem] = useState(INITIAL_ITEM_STATE)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [clientDetails, setClientDetails] = useState({ name: "", phone: "" })
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formattedDate = format(new Date(), "dd/MM/yyyy")
  const pdfOptions = useMemo(() => ({
    margin: 10,
    filename: `quotation-${format(new Date(), "yyyy-MM-dd")}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait'
    },
    autoPaging: 'text',  // This line is needed to ensure smooth text flow across pages but it causes text overlapping vertically.

  }), [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentItem(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleAddItem = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    const sqft = currentItem.sqft ? Number.parseFloat(currentItem.sqft) : null
    const rate = Number.parseFloat(currentItem.rate)
    const box = Number.parseFloat(currentItem.box)

    const newItem: QuotationItem = {
      id: Date.now(),
      itemName: currentItem.itemName,
      size: currentItem.size,
      box,
      sqft,
      rate,
      total: sqft ? sqft * rate : box * rate,
      remarks: currentItem.remarks,
    }

    setItems(prev => [...prev, newItem])
    setCurrentItem(INITIAL_ITEM_STATE)
  }, [currentItem])

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const calculateTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }, [items])

  const total = useMemo(() => calculateTotal(), [calculateTotal])

  const generatePDF = useCallback(async () => {
    if (!pdfRef.current) {
      console.error("PDF reference is null")
      alert("Could not find the content to generate PDF. Please try again.")
      return
    }

    setIsGeneratingPDF(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      await html2pdf().set(pdfOptions).from(pdfRef.current).save()
    } catch (error) {
      console.error("PDF Generation Error:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }, [pdfOptions])

  if (!mounted) {
    return null // Prevent server-side rendering
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Card className="bg-[#12325f]/5">
        <CardHeader className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#12325f] mb-2">Our Own Marble House</h1>
            <p className="text-[#12325f]/70">Thrissur Road, Irinjalakuda, Thrissur, Kerala 680121</p>
            <p className="text-[#12325f]/70">Phone: +91 70349 03099 | Email: ourownmarbles@gmail.com</p>
          </div>
          <div className="flex justify-between">
            <CardTitle className="text-[#12325f]">Proforma Invoice Creator</CardTitle>
            <div className="text-sm text-[#12325f]/70">Date: {formattedDate}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-[#12325f]">
                Client Name
              </Label>
              <Input
                id="clientName"
                value={clientDetails.name}
                onChange={(e) => setClientDetails((prev) => ({ ...prev, name: e.target.value }))}
                className="border-[#12325f]/20 focus-visible:ring-[#12325f]"
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone" className="text-[#12325f]">
                Phone Number
              </Label>
              <Input
                id="clientPhone"
                value={clientDetails.phone}
                onChange={(e) => setClientDetails((prev) => ({ ...prev, phone: e.target.value }))}
                className="border-[#12325f]/20 focus-visible:ring-[#12325f]"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ItemForm
            currentItem={currentItem}
            onInputChange={handleInputChange}
            onSubmit={handleAddItem}
          />
          {items.length > 0 && (
            <QuotationTable items={items} onRemoveItem={removeItem} />
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex w-full justify-between border-t border-[#12325f]/20 pt-4">
            <div className="text-lg font-semibold text-[#12325f]">
              Total Items: {items.length}
            </div>
            <div className="text-lg font-semibold text-[#12325f]">
              Grand Total: ₹{total.toFixed(2)}
            </div>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-4 flex justify-end">
        <Button 
          onClick={generatePDF} 
          disabled={isGeneratingPDF} 
          className="gap-2 bg-[#12325f] hover:bg-[#12325f]/90"
        >
          {isGeneratingPDF ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generating PDF...</>
          ) : (
            <><Download className="h-4 w-4" />Download PDF</>
          )}
        </Button>
      </div>

      <PDFTemplate
        ref={pdfRef}
        items={items}
        clientDetails={clientDetails}
        calculateTotal={calculateTotal}
      />
    </div>
  )
}
