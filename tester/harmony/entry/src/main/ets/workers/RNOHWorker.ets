/**
 * Importing some ets files in the following way results in runtime errors e.g.
 * import { setupRNOHWorker } from "@rnoh/react-native-openharmony"
 *
 * It looks like this is ArkTS problem and it may be fixed in the future.
 * For the time being, use direct imports.
 */
import type { WorkerRNInstanceConfig } from '@rnoh/react-native-openharmony/src/main/ets/setupRNOHWorker'
import { setupRNOHWorker } from "@rnoh/react-native-openharmony/src/main/ets/setupRNOHWorker"
import { createRNPackages } from "../RNPackagesFactory"

setupRNOHWorker({
  createWorkerRNInstanceConfig: (): WorkerRNInstanceConfig => (
    { thirdPartyPackagesFactory: createRNPackages }
  )
})
