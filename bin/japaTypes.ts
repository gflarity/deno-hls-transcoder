import 'npm:@japa/runner'
import { Assert } from 'npm:@japa/assert'

declare module 'npm:@japa/runner' {
  interface TestContext {
    assert: Assert
  }

  interface Test<TestData> {
    // notify TypeScript about custom test properties
  }
}
