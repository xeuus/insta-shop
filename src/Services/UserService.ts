import {Autowired, Observable, Order, Persisted, Piped, RequestContext, Service, ServiceEvents} from "coreact";
import {Networking} from "Services/Networking";
import {ParallelJob} from "Services/ParallelJob";

@Service
@Order(-10)
export class UserService extends ParallelJob {
  private networking = Autowired(Networking, this);
  private context: RequestContext;
  @Observable @Piped private token = '';
  @Piped private clientName = '';
  @Piped private gateway = 'PWA';
  @Piped private mobileNumber = '';
  @Piped private fullName = '';
  @Piped private id = 0;

  private COOKIE_NAME = 'INSTA';
  private MIDDLEWARE_NAME = 'AUTH';

  public get isLoggedIn(){
    return !!this.token;
  };

  public async useToken(token: string) {
    await this.authorize(token);
    this.registerMiddleware(token);
    this.context.cookies = {
      ...this.context.cookies,
      [this.COOKIE_NAME]: token,
    };
    this.token = token;
  }


  public logout = () => {
    this.mobileNumber = '';
    this.fullName = '';
    this.id = 0;
    this.context.cookies = {
      ...this.context.cookies,
      [this.COOKIE_NAME]: null,
    };
    this.networking.MIDDLEWARE(this.MIDDLEWARE_NAME, null);
    this.token = '';
  };


  private static parseClientName(useragent: any) {
    let screen = '';
    if (useragent.isMobile) {
      screen = 'mobile'
    }
    if (useragent.isDesktop) {
      screen = 'desktop'
    }
    return `${useragent.platform}/${screen}/${useragent.browser}:${useragent.version}`
  }

  private async serviceWillLoad(context: RequestContext) {
    if (context.environment == 'client') {
      this.registerMiddleware(this.token);
    } else {
      try {
        const token = context.cookies[this.COOKIE_NAME];
        if (token) {
          await this.authorize(token);
          this.registerMiddleware(token);
          this.token = token;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  private registerMiddleware = (token: string) => {
    this.clientName = UserService.parseClientName(this.context.useragent);
    this.networking.MIDDLEWARE(this.MIDDLEWARE_NAME, (request) => ({
      ...request,
      headers: {
        'App-Gateway': this.gateway,
        'Client-Name': this.clientName,
        'Authorization': `Bearer ${token}`,
        ...request.headers,
      }
    }))
  };

  private authorize = async (token: string) => {
    this.clientName = UserService.parseClientName(this.context.useragent);
    const response = await this.networking.REQUEST<{
      id: number,
      name: string,
      username: string,
      mobileNumber: string,
    }>({
      url: '/user/info',
      method: 'GET',
      headers: {
        'App-Gateway': this.gateway,
        'Client-Name': this.clientName,
        'Authorization': `Bearer ${token}`,
      }
    });
    const {id, name, mobileNumber} = response.payload;
    this.id = id;
    this.fullName = name;
    this.mobileNumber = mobileNumber;
  };
}