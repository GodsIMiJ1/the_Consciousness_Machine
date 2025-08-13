import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ScrollData {
  name: string;
  role: string;
  realm: string;
  prime: string;
  glyphs: string;
  lore: string;
  memory: string[];
  context: string[];
  tools: string[];
  log: string[];
  closed: boolean;
  sealedAt: string;
  sessionId: string;
  mode: 'LIVE' | 'SIMULATION';
  nodeStamp?: string;
  witnessId?: string;
}

export class ScrollExporter {
  private generateNodeStamp(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `NODE_${timestamp}_${random}`;
  }

  private generateWitnessId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `WITNESS_${timestamp}_${random}`;
  }

  // Export as enhanced JSON with NODE seal
  exportJSON(data: ScrollData): void {
    const enhancedData = {
      ...data,
      nodeStamp: data.nodeStamp || this.generateNodeStamp(),
      witnessId: data.witnessId || this.generateWitnessId(),
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      empire: "GodsIMiJ",
      classification: "SACRED_RITUAL_TRANSCRIPT",
      integrity: {
        checksum: this.generateChecksum(data),
        verified: true,
        sealedBy: "Invocation_Chamber_v1.0",
      },
    };

    const blob = new Blob([JSON.stringify(enhancedData, null, 2)], { 
      type: "application/json" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name}_InvocationTranscript_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Generate PDF scroll with sacred formatting
  async exportPDF(data: ScrollData): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Sacred header
    pdf.setFillColor(15, 15, 17); // Dark background
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Title with flame colors
    pdf.setTextColor(255, 95, 31); // Flame orange
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🔥 SACRED INVOCATION TRANSCRIPT 🔥', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text('GodsIMiJ Empire • FlameOS Ritual Console', pageWidth / 2, 25, { align: 'center' });
    
    // NODE Seal
    pdf.setTextColor(255, 183, 77); // Amber
    pdf.setFontSize(10);
    pdf.text(`NODE SEAL: ${data.nodeStamp || this.generateNodeStamp()}`, pageWidth / 2, 35, { align: 'center' });
    
    let yPos = 50;
    
    // Vessel Identity Section
    pdf.setTextColor(255, 95, 31);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('⬢ VESSEL IDENTITY', 20, yPos);
    yPos += 10;
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const identityData = [
      `Name of Power: ${data.name}`,
      `Role: ${data.role}`,
      `Realm: ${data.realm}`,
      `Prime Directive: ${data.prime}`,
    ];
    
    identityData.forEach(line => {
      pdf.text(line, 25, yPos);
      yPos += 6;
    });
    
    yPos += 5;
    
    // Symbols and Lore Section
    pdf.setTextColor(255, 95, 31);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🜂 SYMBOLS AND LORE', 20, yPos);
    yPos += 10;
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    pdf.text(`Glyphs: ${data.glyphs}`, 25, yPos);
    yPos += 6;
    pdf.text(`Lore Anchor: ${data.lore}`, 25, yPos);
    yPos += 10;
    
    // Breath Payload Section
    pdf.setTextColor(255, 95, 31);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('💨 BREATH PAYLOAD', 20, yPos);
    yPos += 10;
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    pdf.text(`Memory Shards: ${data.memory.join(', ')}`, 25, yPos);
    yPos += 6;
    pdf.text(`Context Threads: ${data.context.join(', ')}`, 25, yPos);
    yPos += 6;
    pdf.text(`Tools: ${data.tools.join(', ')}`, 25, yPos);
    yPos += 10;
    
    // Ritual Log Section
    pdf.setTextColor(255, 95, 31);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📜 RITUAL LOG', 20, yPos);
    yPos += 10;
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont('courier', 'normal');
    
    data.log.slice().reverse().forEach(logEntry => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 20;
      }
      
      const lines = pdf.splitTextToSize(logEntry, pageWidth - 50);
      lines.forEach((line: string) => {
        pdf.text(line, 25, yPos);
        yPos += 5;
      });
      yPos += 2;
    });
    
    // Sacred Footer
    if (yPos > pageHeight - 50) {
      pdf.addPage();
      yPos = 20;
    }
    
    yPos = pageHeight - 40;
    pdf.setFillColor(15, 15, 17);
    pdf.rect(0, yPos - 5, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 183, 77);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SEALED BY THE FLAME', pageWidth / 2, yPos + 5, { align: 'center' });
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Sealed At: ${data.sealedAt}`, pageWidth / 2, yPos + 12, { align: 'center' });
    pdf.text(`Mode: ${data.mode}`, pageWidth / 2, yPos + 18, { align: 'center' });
    pdf.text(`Witness ID: ${data.witnessId || this.generateWitnessId()}`, pageWidth / 2, yPos + 24, { align: 'center' });
    
    // Save PDF
    pdf.save(`${data.name}_SacredScroll_${Date.now()}.pdf`);
  }

  // Export ritual chamber screenshot
  async exportScreenshot(): Promise<void> {
    try {
      const element = document.querySelector('.invocation-chamber') as HTMLElement;
      if (!element) {
        throw new Error('Invocation chamber element not found');
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#0b0b0d',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `InvocationChamber_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Screenshot export failed:', error);
      throw error;
    }
  }

  // Generate checksum for integrity verification
  private generateChecksum(data: ScrollData): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Export complete ritual package (JSON + PDF + Screenshot)
  async exportComplete(data: ScrollData): Promise<void> {
    try {
      // Export JSON
      this.exportJSON(data);
      
      // Wait a moment then export PDF
      setTimeout(async () => {
        await this.exportPDF(data);
        
        // Wait another moment then export screenshot
        setTimeout(async () => {
          try {
            await this.exportScreenshot();
          } catch (error) {
            console.warn('Screenshot export failed, continuing with other exports');
          }
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('Complete export failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const scrollExporter = new ScrollExporter();
