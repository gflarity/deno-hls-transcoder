import { assert } from 'npm:@japa/assert'
import { specReporter } from 'npm:@japa/spec-reporter'
import { processCliArgs, configure, run } from 'npm:@japa/runner'

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/
configure({
  ...processCliArgs(Deno.args),
  ...{
    files: ['tests/**/*.spec.ts'],
    plugins: [assert()],
    reporters: [specReporter()],
    importer: (filePath) => import(filePath),
    timeout: 60000, // Set to 1 minute, might need to be longer though
  },
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run()
