import {Service} from "coreact";

@Service
export class RoutesService {
  public LoginOTPPage() {
    return '/login/otp/';
  }
  public LoginPasswordPage() {
    return '/login/password/';
  }

  public  AuthConfirmPage() {
    return '/login/confirm/';
  }

  public RegisterPage() {
    return '/register/';
  }
  public FeedsPage() {
    return '/';
  }
  public SearchPage() {
    return '/search/';
  }
  public UploadCamera() {
    return '/upload/';
  }
  public Post() {
    return '/upload/post/';
  }
  public ActivityPage() {
    return '/activity/';
  }
  public ProfilePage() {
    return '/profile/';
  }
}
