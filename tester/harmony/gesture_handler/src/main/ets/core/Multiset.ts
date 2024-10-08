export class Multiset<T> {
  private multiplicityByElement: Map<T, number> = new Map();
  private elements: T[] = [];

  add(element: T) {
    const count = this.multiplicityByElement.get(element) || 0;
    if (count === 0) {
      this.elements.push(element);
    }
    this.multiplicityByElement.set(element, count + 1);
  }

  remove(element: T) {
    const count = this.multiplicityByElement.get(element) || 0;
    if (count > 1) {
      this.multiplicityByElement.set(element, count - 1);
    } else {
      this.multiplicityByElement.delete(element);
      this.elements = this.elements.filter(v => v !== element);
    }
  }

  getElements() {
    return this.elements;
  }
}
