import { Directions, DiagonalDirections } from "./IncomingEvent"

type Cosine = number

export class Vector2D {
  static fromDirection(direction: Directions | DiagonalDirections): Vector2D {
    const DirectionToVectorMappings = new Map<
      Directions | DiagonalDirections,
      Vector2D
    >([
      [Directions.LEFT, new Vector2D({ x: -1, y: 0 })],
      [Directions.RIGHT, new Vector2D({ x: 1, y: 0 })],
      [Directions.UP, new Vector2D({ x: 0, y: -1 })],
      [Directions.DOWN, new Vector2D({ x: 0, y: 1 })],
      [DiagonalDirections.UP_RIGHT, new Vector2D({ x: 1, y: -1 })],
      [DiagonalDirections.DOWN_RIGHT, new Vector2D({ x: 1, y: 1 })],
      [DiagonalDirections.UP_LEFT, new Vector2D({ x: -1, y: -1 })],
      [DiagonalDirections.DOWN_LEFT, new Vector2D({ x: -1, y: 1 })],
    ]);
    return DirectionToVectorMappings.get(direction)!;
  }


  constructor(
    private val: {
      x: number;
      y: number;
    } = {x: 0, y: 0},
  ) {}

  get x() {
    return this.val.x;
  }

  get y() {
    return this.val.y;
  }

  get value() {
    return {...this.val};
  }

  public clone() {
    return new Vector2D({...this.val});
  }

  public subtract(vec: Vector2D) {
    this.val.x -= vec.x;
    this.val.y -= vec.y;
    return this;
  }

  public add(vec: Vector2D) {
    this.val.x += vec.x;
    this.val.y += vec.y;
    return this;
  }

  public createUnitVector(): Vector2D {
    const magnitude = this.magnitude
    if (magnitude === 0) {
      return new Vector2D({ x: 0, y: 0 });
    }
    return new Vector2D({
      x: this.val.x / magnitude,
      y: this.val.y / magnitude
    });
  }

  public computeCosine(other: Vector2D): Cosine {
    const thisUnit = this.createUnitVector();
    const otherUnit = other.createUnitVector();
    return thisUnit.val.x * otherUnit.val.x + thisUnit.val.y * otherUnit.val.y;
  }

  public get magnitude() {
    return Math.hypot(this.x, this.y);
  }
}
