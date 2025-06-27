export class RegisterPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  async register(name, email, password) {
    try {
      await this.model.register(name, email, password);
      return true;
    } catch (error) {
      this.view.showError(error.message);
      return false;
    }
  }
}