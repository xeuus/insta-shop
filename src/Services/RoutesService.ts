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
  public AddPage() {
    return '/add/';
  }
  public ActivityPage() {
    return '/activity/';
  }
  public ProfilePage() {
    return '/profile/';
  }
}