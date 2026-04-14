import type { StartedBrowserSession } from '../types/session.js';
import type { ProviderName } from '../types/providerConfig.js';

export interface ProviderStartSessionParams {
  sessionName: string | null;
}

export abstract class BrowserProvider {
  readonly name: ProviderName;

  protected constructor(name: ProviderName) {
    this.name = name;
  }

  abstract startSession(params: ProviderStartSessionParams): Promise<StartedBrowserSession>;

  abstract closeSession(session: StartedBrowserSession): Promise<void>;
}
