export class StoryPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  async getAllStories() {
    try {
      const stories = await this.model.getStories();
      this.view.displayStories(stories);
    } catch (error) {
      this.view.showError(error.message);
    }
  }
}
