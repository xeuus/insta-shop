import {Observable, optional, Service} from "coreact";

@Service
export class ImagingService {

  private input: HTMLInputElement = null;

  @Observable
  images: any[] = [];


  fromGallery() {
    if (this.input) {
      document.documentElement.removeChild(this.input);
      this.input = null;
    }
    this.input = document.createElement('input');
    const input = this.input;
    input.setAttribute('type', 'file');
    input.setAttribute('multiple', 'true');
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    document.documentElement.appendChild(input);
    input.click();

    return new Promise((acc, rej) => {
      input.onchange = () => {
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          this.images.push(file)
        }
      };
    });


  }
}
