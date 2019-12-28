import {Autowired, Debounced, Observable, Persisted, Service, Timer} from "coreact";
import {UserService} from "Services/UserService";
import {ParallelJob} from "Services/ParallelJob";
import {Networking} from "Services/Networking";

@Service
export class LoginService extends ParallelJob {
  private networking = Autowired(Networking, this);

  user = Autowired(UserService, this);

  METHOD_LOGIN = 0;
  METHOD_REGISTER = 1;

  @Persisted method = this.METHOD_LOGIN;
  @Persisted mobileNumber = '';
  @Persisted fullName = '';
  @Persisted password = '';
  @Persisted username = '';
  @Persisted resendAt = 0;
  @Observable @Persisted codeSent = false;
  @Observable @Persisted remaining = 0;

  @Timer(1000)
  timer = () => {
    const diff = this.resendAt - Date.now();
    if (diff < 0) {
      this.codeSent = false;
      return false;
    }
    this.remaining = Math.floor(diff / 1000);
  };


  public register = async (user: {
    username: string
    mobileNumber: string
    password: string
    name: string
    otp: string
  }) => {
    const job = await this.newProcess('confirm');
    try {
      const response = await this.networking.POST<{ token: string }>('/auth/register', user);
      const {token} = response.payload;
      await this.user.useToken(token);
      job.succeed();
    } catch (e) {
      job.failed(e.payload.message, e.payload.validation);
      throw e;
    }
  };

  sendOTP = async (mobileNumber: string) => {
    if (!this.codeSent) {
      const response = await this.networking.GET<{ resendAt: number }>(`/auth/otp/${mobileNumber}`);
      this.resendAt = Date.now() + (response.payload.resendAt * 1000);
      this.remaining = response.payload.resendAt;
      this.codeSent = true;
      (this.timer as any).start();
    }
  };

  @Debounced(100)
  proceed = async (code: string) => {
    if (this.method === this.METHOD_LOGIN) {
      await this.login(this.mobileNumber, code, 'otp');
    } else {
      await this.register({
        name: this.fullName,
        mobileNumber: this.mobileNumber,
        username: this.username,
        otp: code,
        password: this.password,
      });
    }
    this.reset();
  };

  public check = async (user: {
    username: string
    mobileNumber: string
    password: string
    name: string
  }) => {
    const job = await this.newProcess('check');
    try {
      await this.networking.POST('/auth/check', user);
      job.succeed();
    } catch (e) {
      job.failed(e.payload.message, e.payload.validation);
      throw e;
    }
  };


  public login = async (username: string, password: string, type: 'otp' | 'password') => {
    const job = await this.newProcess('confirm');
    try {
      const response = await this.networking.REQUEST<{ token: string }>({
        url: type == 'otp' ? '/auth/login/otp' : '/auth/login/password',
        method: 'POST',
        payload: {
          username: username,
          [type]: password,
        },
      });
      const {token} = response.payload;
      await this.user.useToken(token);
      job.succeed();
    } catch (e) {
      job.failed(e.payload.message, e.payload.validation);
      throw e;
    }
  };

  public reset = () => {
    this.method = this.METHOD_LOGIN;
    this.mobileNumber = '';
    this.fullName = '';
    this.password = '';
    this.username = '';
    this.resendAt = 0;
    this.codeSent = false;
    this.remaining = 0;
  };
}