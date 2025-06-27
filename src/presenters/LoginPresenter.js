export class LoginPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  async login(email, password) {
    try {
      await this.model.login(email, password);
      return true;
    } catch (error) {
      this.view.showError(error.message);
      return false;
    }
  }
}