import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[dateMask]',
  standalone: true,
})
export class DateMaskDirective {
  private isFormatting = false;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    if (this.isFormatting) return;

    const input = this.el.nativeElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 8);

    let masked = '';
    if (digits.length <= 2) {
      masked = digits;
    } else if (digits.length <= 4) {
      masked = digits.slice(0, 2) + '/' + digits.slice(2);
    } else {
      masked = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    }

    this.isFormatting = true;
    input.value = masked;
    // Notifica o MatDatepickerInput para re-parsear o valor formatado
    input.dispatchEvent(new Event('input', { bubbles: true }));
    this.isFormatting = false;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End',
    ];
    if (allowed.includes(event.key)) return;

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const digits = this.el.nativeElement.value.replace(/\D/g, '');
    if (digits.length >= 8) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') ?? '';
    const digits = paste.replace(/\D/g, '').slice(0, 8);
    const input = this.el.nativeElement;
    input.value = digits;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
