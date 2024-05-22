const DEFAULT_HOST = "https://api.useembed.com";
const DEFAULT_WEBSOCKET_PATH = "/";

export type EmbedOptions = {
  host?: string;
};

export type ConnectOptions = {
  flow?: "popup" | "redirect";
  redirectUrl?: string;
};

export class Embed {
  private hostBaseUrl: string;
  private websocketBaseUrl: string;

  constructor(options?: EmbedOptions) {
    const host = options?.host || DEFAULT_HOST;
    const websocketPath = DEFAULT_WEBSOCKET_PATH;
    this.hostBaseUrl = host.endsWith("/") ? host.slice(0, -1) : host;

    try {
      const baseUrl = new URL(this.hostBaseUrl);
      const websocketUrl = new URL(websocketPath, baseUrl);
      this.websocketBaseUrl = websocketUrl
        .toString()
        .replace("https://", "wss://")
        .replace("http://", "ws://");
    } catch (err) {
      throw new Error("Invalid host URL");
    }
  }

  public connect(
    sessionToken: string,
    options?: ConnectOptions
  ): Promise<{ connectionId: string }> {
    if (!sessionToken) {
      throw new Error("Session token is required");
    }

    return new Promise((resolve, reject) => {
      const onSuccess = (connectionId: string) => {
        return resolve({ connectionId });
      };

      const onError = (error: Error) => {
        return reject(error);
      };

      const url = `${this.hostBaseUrl}/session/${sessionToken}`;
      const flow = options?.flow;
      const redirectUrl = options?.redirectUrl;

      if (flow === "popup" || (!flow && !redirectUrl)) {
        createSessionPopup({
          url,
          websocketUrl: this.websocketBaseUrl,
          onSuccess,
          onError,
        });
      }

      if (flow === "redirect" || (!flow && redirectUrl)) {
        const params: {
          flow: string;
          redirect_url?: string;
        } = { flow: "redirect" };

        if (redirectUrl) {
          params.redirect_url = redirectUrl;
        }

        window.location.href = appendParamsToUrl(url, params);
      }

      if (flow && flow !== "popup" && flow !== "redirect") {
        const err = new Error("Invalid flow");
        onError(err);
      }
    });
  }
}

type SessionPopupOptions = {
  url: string;
  websocketUrl: string;
  onSuccess: (connectionId: string) => any;
  onError: (error: Error) => any;
};

function createSessionPopup(options: SessionPopupOptions) {
  return new SessionPopup(options);
}

enum MessageType {
  ConnectionAck = "connection_ack",
  Error = "error",
  Success = "success",
}

class SessionPopup {
  private url: string;
  private socket: WebSocket;
  private window: Window;

  constructor(options: SessionPopupOptions) {
    this.url = options.url;

    const layout = this.getLayout(500, 600);
    const featuresString = this.featuresToString({
      width: layout.computedWidth,
      height: layout.computedHeight,
      top: layout.top,
      left: layout.left,
      scrollbars: "yes",
      resizable: "yes",
      status: "no",
      toolbar: "no",
      location: "no",
      copyhistory: "no",
      menubar: "no",
      directories: "no",
    });

    this.window = window.open("", "_blank", featuresString)!;
    this.socket = new WebSocket(options.websocketUrl);
    this.socket.onmessage = (message: MessageEvent) => {
      this.handleMessage(message, options.onSuccess, options.onError);
    };
  }

  private handleMessage(
    message: MessageEvent,
    onSuccess: (connectionId: string) => any,
    onError: (error: Error) => any
  ) {
    const data = JSON.parse(message.data);
    switch (data.message_type) {
      case MessageType.ConnectionAck:
        const params = {
          flow: "popup",
          ws_client_id: data.ws_client_id,
          prefers_dark_mode: this.prefersDarkMode(),
        };
        this.window.location = appendParamsToUrl(this.url, params);
        break;

      case MessageType.Error:
        const error = new Error(data.error);
        onError(error);
        this.socket.close();
        break;

      case MessageType.Success:
        onSuccess(data.connection_id);
        this.socket.close();
        break;

      default:
        return;
    }
  }

  private prefersDarkMode() {
    const pefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return pefersDark.toString();
  }

  private getLayout(width: number, height: number) {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const left = screenWidth / 2 - width / 2;
    const top = screenHeight / 2 - height / 2;
    const computedWidth = Math.min(width, screenWidth);
    const computedHeight = Math.min(height, screenHeight);

    return {
      left: Math.max(left, 0),
      top: Math.max(top, 0),
      computedWidth,
      computedHeight,
    };
  }

  private featuresToString(features: Record<string, any>): string {
    return Object.entries(features)
      .map(([key, value]) => `${key}=${value}`)
      .join(",");
  }
}

function appendParamsToUrl(url: string, params: Record<string, string>) {
  const baseUrl = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    baseUrl.searchParams.set(key, value);
  });

  return baseUrl.toString();
}
