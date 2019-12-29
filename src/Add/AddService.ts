import {Autowired, Observable, optional, Persisted, Service} from "coreact";
import {Networking} from "Services/Networking";

export interface ImagePrototype {
  src: string
  id: string
}

@Service
export class AddService {
  private networking = Autowired(Networking, this);
  private input: HTMLInputElement = null;

  @Observable @Persisted image: ImagePrototype = null;

  startUpload = async () => {
    this.image = await this.upload<ImagePrototype>('/photo/upload', {});
  };


  delete = async () => {
    this.image = null;
  };

  post = async (title: string) => {
    await this.networking.POST('/user/post', {
      photoId: this.image.id,
      title: title,
    });
    this.image = null;
  };

  private upload<T>(address: string, payload: { [key: string]: any }) {
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
    return new Promise<T>((acc, rej) => {
      input.onchange = () => {
        const data = new FormData();
        for (let i = 0; i < input.files.length; i++) {
          data.append('file' + i, input.files[i]);
        }
        Object.keys(payload).forEach(a => data.append(a, payload[a]));
        this.networking.REQUEST({
          url: address,
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          payload: data,
        }).then((response) => {
          acc(optional(() => response.payload, {}));
          document.documentElement.removeChild(input);
          this.input = null;
        }).catch(() => {
          rej();
          document.documentElement.removeChild(input);
          this.input = null;
        });
      };
    });
  }
}