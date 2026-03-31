import {
  Observable,
  __async,
  __awaiter,
  __generator,
  __objRest,
  __spreadProps,
  __spreadValues,
  from
} from "./chunk-VFONPCEY.js";

// node_modules/@aws-amplify/core/dist/esm/errors/AmplifyError.mjs
var AmplifyError = class _AmplifyError extends Error {
  /**
   *  Constructs an AmplifyError.
   *
   * @param message text that describes the main problem.
   * @param underlyingError the underlying cause of the error.
   * @param recoverySuggestion suggestion to recover from the error.
   *
   */
  constructor({ message, name, recoverySuggestion, underlyingError, metadata }) {
    super(message);
    this.name = name;
    this.underlyingError = underlyingError;
    this.recoverySuggestion = recoverySuggestion;
    if (metadata) {
      const { extendedRequestId, httpStatusCode, requestId } = metadata;
      this.metadata = { extendedRequestId, httpStatusCode, requestId };
    }
    this.constructor = _AmplifyError;
    Object.setPrototypeOf(this, _AmplifyError.prototype);
  }
};

// node_modules/@aws-amplify/core/dist/esm/errors/APIError.mjs
var ApiError = class _ApiError extends AmplifyError {
  /**
   * The unwrapped HTTP response causing the given API error.
   */
  get response() {
    return this._response ? replicateApiErrorResponse(this._response) : void 0;
  }
  constructor(params) {
    super(params);
    this.constructor = _ApiError;
    Object.setPrototypeOf(this, _ApiError.prototype);
    if (params.response) {
      this._response = params.response;
    }
  }
};
var replicateApiErrorResponse = (response) => __spreadProps(__spreadValues({}, response), {
  headers: __spreadValues({}, response.headers)
});

// node_modules/@aws-amplify/core/dist/esm/types/errors.mjs
var AmplifyErrorCode;
(function(AmplifyErrorCode2) {
  AmplifyErrorCode2["NoEndpointId"] = "NoEndpointId";
  AmplifyErrorCode2["PlatformNotSupported"] = "PlatformNotSupported";
  AmplifyErrorCode2["Unknown"] = "Unknown";
  AmplifyErrorCode2["NetworkError"] = "NetworkError";
})(AmplifyErrorCode || (AmplifyErrorCode = {}));

// node_modules/@aws-amplify/core/dist/esm/errors/createAssertionFunction.mjs
var createAssertionFunction = (errorMap, AssertionError = AmplifyError) => (assertion, name, additionalContext) => {
  const { message, recoverySuggestion } = errorMap[name];
  if (!assertion) {
    throw new AssertionError({
      name,
      message: additionalContext ? `${message} ${additionalContext}` : message,
      recoverySuggestion
    });
  }
};

// node_modules/@aws-amplify/core/dist/esm/errors/errorHelpers.mjs
var amplifyErrorMap = {
  [AmplifyErrorCode.NoEndpointId]: {
    message: "Endpoint ID was not found and was unable to be created."
  },
  [AmplifyErrorCode.PlatformNotSupported]: {
    message: "Function not supported on current platform."
  },
  [AmplifyErrorCode.Unknown]: {
    message: "An unknown error occurred."
  },
  [AmplifyErrorCode.NetworkError]: {
    message: "A network error has occurred."
  }
};
var assert = createAssertionFunction(amplifyErrorMap);

// node_modules/@aws-amplify/core/dist/esm/utils/globalHelpers/index.mjs
var getCrypto = () => {
  if (typeof window === "object" && typeof window.crypto === "object") {
    return window.crypto;
  }
  if (typeof crypto === "object") {
    return crypto;
  }
  throw new AmplifyError({
    name: "MissingPolyfill",
    message: "Cannot resolve the `crypto` function from the environment."
  });
};
var getBtoa = () => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa;
  }
  if (typeof btoa === "function") {
    return btoa;
  }
  throw new AmplifyError({
    name: "Base64EncoderError",
    message: "Cannot resolve the `btoa` function from the environment."
  });
};
var getAtob = () => {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob;
  }
  if (typeof atob === "function") {
    return atob;
  }
  throw new AmplifyError({
    name: "Base64EncoderError",
    message: "Cannot resolve the `atob` function from the environment."
  });
};

// node_modules/@aws-amplify/core/dist/esm/constants.mjs
var AWS_CLOUDWATCH_CATEGORY = "Logging";
var USER_AGENT_HEADER = "x-amz-user-agent";
var NO_HUBCALLBACK_PROVIDED_EXCEPTION = "NoHubcallbackProvidedException";

// node_modules/@aws-amplify/core/dist/esm/Logger/types.mjs
var LogType;
(function(LogType2) {
  LogType2["DEBUG"] = "DEBUG";
  LogType2["ERROR"] = "ERROR";
  LogType2["INFO"] = "INFO";
  LogType2["WARN"] = "WARN";
  LogType2["VERBOSE"] = "VERBOSE";
  LogType2["NONE"] = "NONE";
})(LogType || (LogType = {}));

// node_modules/@aws-amplify/core/dist/esm/Logger/ConsoleLogger.mjs
var LOG_LEVELS = {
  VERBOSE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
  NONE: 6
};
var ConsoleLogger = class _ConsoleLogger {
  /**
   * @constructor
   * @param {string} name - Name of the logger
   */
  constructor(name, level = LogType.WARN) {
    this.name = name;
    this.level = level;
    this._pluggables = [];
  }
  _padding(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  _ts() {
    const dt = /* @__PURE__ */ new Date();
    return [this._padding(dt.getMinutes()), this._padding(dt.getSeconds())].join(":") + "." + dt.getMilliseconds();
  }
  configure(config) {
    if (!config)
      return this._config;
    this._config = config;
    return this._config;
  }
  /**
   * Write log
   * @method
   * @memeberof Logger
   * @param {LogType|string} type - log type, default INFO
   * @param {string|object} msg - Logging message or object
   */
  _log(type, ...msg) {
    let loggerLevelName = this.level;
    if (_ConsoleLogger.LOG_LEVEL) {
      loggerLevelName = _ConsoleLogger.LOG_LEVEL;
    }
    if (typeof window !== "undefined" && window.LOG_LEVEL) {
      loggerLevelName = window.LOG_LEVEL;
    }
    const loggerLevel = LOG_LEVELS[loggerLevelName];
    const typeLevel = LOG_LEVELS[type];
    if (!(typeLevel >= loggerLevel)) {
      return;
    }
    let log = console.log.bind(console);
    if (type === LogType.ERROR && console.error) {
      log = console.error.bind(console);
    }
    if (type === LogType.WARN && console.warn) {
      log = console.warn.bind(console);
    }
    if (_ConsoleLogger.BIND_ALL_LOG_LEVELS) {
      if (type === LogType.INFO && console.info) {
        log = console.info.bind(console);
      }
      if (type === LogType.DEBUG && console.debug) {
        log = console.debug.bind(console);
      }
    }
    const prefix = `[${type}] ${this._ts()} ${this.name}`;
    let message = "";
    if (msg.length === 1 && typeof msg[0] === "string") {
      message = `${prefix} - ${msg[0]}`;
      log(message);
    } else if (msg.length === 1) {
      message = `${prefix} ${msg[0]}`;
      log(prefix, msg[0]);
    } else if (typeof msg[0] === "string") {
      let obj = msg.slice(1);
      if (obj.length === 1) {
        obj = obj[0];
      }
      message = `${prefix} - ${msg[0]} ${obj}`;
      log(`${prefix} - ${msg[0]}`, obj);
    } else {
      message = `${prefix} ${msg}`;
      log(prefix, msg);
    }
    for (const plugin of this._pluggables) {
      const logEvent = { message, timestamp: Date.now() };
      plugin.pushLogs([logEvent]);
    }
  }
  /**
   * Write General log. Default to INFO
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */
  log(...msg) {
    this._log(LogType.INFO, ...msg);
  }
  /**
   * Write INFO log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */
  info(...msg) {
    this._log(LogType.INFO, ...msg);
  }
  /**
   * Write WARN log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */
  warn(...msg) {
    this._log(LogType.WARN, ...msg);
  }
  /**
   * Write ERROR log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */
  error(...msg) {
    this._log(LogType.ERROR, ...msg);
  }
  /**
   * Write DEBUG log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */
  debug(...msg) {
    this._log(LogType.DEBUG, ...msg);
  }
  /**
   * Write VERBOSE log
   * @method
   * @memeberof Logger
   * @param {string|object} msg - Logging message or object
   */
  verbose(...msg) {
    this._log(LogType.VERBOSE, ...msg);
  }
  addPluggable(pluggable) {
    if (pluggable && pluggable.getCategoryName() === AWS_CLOUDWATCH_CATEGORY) {
      this._pluggables.push(pluggable);
      pluggable.configure(this._config);
    }
  }
  listPluggables() {
    return this._pluggables;
  }
};
ConsoleLogger.LOG_LEVEL = null;
ConsoleLogger.BIND_ALL_LOG_LEVELS = false;

// node_modules/@aws-amplify/core/dist/esm/utils/getClientInfo/getClientInfo.mjs
var logger = new ConsoleLogger("getClientInfo");

// node_modules/@aws-amplify/core/dist/esm/utils/isBrowser.mjs
var isBrowser = () => typeof window !== "undefined" && typeof window.document !== "undefined";

// node_modules/@aws-amplify/core/dist/esm/utils/isWebWorker.mjs
var isWebWorker = () => {
  if (typeof self === "undefined") {
    return false;
  }
  const selfContext = self;
  return typeof selfContext.WorkerGlobalScope !== "undefined" && self instanceof selfContext.WorkerGlobalScope;
};

// node_modules/@aws-amplify/core/dist/esm/utils/retry/NonRetryableError.mjs
var NonRetryableError = class extends Error {
  constructor() {
    super(...arguments);
    this.nonRetryable = true;
  }
};

// node_modules/@aws-amplify/core/dist/esm/utils/retry/isNonRetryableError.mjs
var isNonRetryableError = (obj) => {
  const key = "nonRetryable";
  return obj && obj[key];
};

// node_modules/@aws-amplify/core/dist/esm/utils/retry/constants.mjs
var MAX_DELAY_MS = 5 * 60 * 1e3;

// node_modules/@aws-amplify/core/dist/esm/utils/retry/jitteredBackoff.mjs
function jitteredBackoff(maxDelayMs = MAX_DELAY_MS) {
  const BASE_TIME_MS = 100;
  const JITTER_FACTOR = 100;
  return (attempt) => {
    const delay = 2 ** attempt * BASE_TIME_MS + JITTER_FACTOR * Math.random();
    return delay > maxDelayMs ? false : delay;
  };
}

// node_modules/@aws-amplify/core/dist/esm/utils/retry/retry.mjs
var logger2 = new ConsoleLogger("retryUtil");
function retry(functionToRetry, args, delayFn, onTerminate) {
  return __async(this, null, function* () {
    if (typeof functionToRetry !== "function") {
      throw Error("functionToRetry must be a function");
    }
    return new Promise((resolve, reject) => __async(this, null, function* () {
      let attempt = 0;
      let terminated = false;
      let timeout;
      let wakeUp = () => {
      };
      let lastError;
      onTerminate && onTerminate.then(() => {
        terminated = true;
        clearTimeout(timeout);
        wakeUp();
      });
      while (!terminated) {
        attempt++;
        logger2.debug(`${functionToRetry.name} attempt #${attempt} with this vars: ${JSON.stringify(args)}`);
        try {
          resolve(yield functionToRetry(...args));
          return;
        } catch (err) {
          lastError = err;
          logger2.debug(`error on ${functionToRetry.name}`, err);
          if (isNonRetryableError(err)) {
            logger2.debug(`${functionToRetry.name} non retryable error`, err);
            reject(err);
            return;
          }
          const retryIn = delayFn(attempt, args, err);
          logger2.debug(`${functionToRetry.name} retrying in ${retryIn} ms`);
          if (retryIn === false || terminated) {
            reject(err);
            return;
          } else {
            yield new Promise((_resolve) => {
              wakeUp = _resolve;
              timeout = setTimeout(wakeUp, retryIn);
            });
          }
        }
      }
      reject(lastError);
    }));
  });
}

// node_modules/@aws-amplify/core/dist/esm/utils/retry/jitteredExponentialRetry.mjs
var jitteredExponentialRetry = (functionToRetry, args, maxDelayMs = MAX_DELAY_MS, onTerminate) => retry(functionToRetry, args, jitteredBackoff(maxDelayMs), onTerminate);

// node_modules/@aws-amplify/core/dist/esm/utils/urlSafeDecode.mjs
function urlSafeDecode(hex) {
  const matchArr = hex.match(/.{2}/g) || [];
  return matchArr.map((char) => String.fromCharCode(parseInt(char, 16))).join("");
}

// node_modules/@aws-amplify/core/dist/esm/utils/deDupeAsyncFunction.mjs
var deDupeAsyncFunction = (asyncFunction) => {
  let inflightPromise;
  return (...args) => __async(void 0, null, function* () {
    if (inflightPromise)
      return inflightPromise;
    inflightPromise = new Promise((resolve, reject) => {
      asyncFunction(...args).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      }).finally(() => {
        inflightPromise = void 0;
      });
    });
    return inflightPromise;
  });
};

// node_modules/@aws-amplify/core/dist/esm/utils/isTokenExpired.mjs
function isTokenExpired({ expiresAt, clockDrift, tolerance = 5e3 }) {
  const currentTime = Date.now();
  return currentTime + clockDrift + tolerance > expiresAt;
}

// node_modules/@aws-amplify/core/dist/esm/parseAWSExports.mjs
var logger3 = new ConsoleLogger("parseAWSExports");
var authTypeMapping = {
  API_KEY: "apiKey",
  AWS_IAM: "iam",
  AMAZON_COGNITO_USER_POOLS: "userPool",
  OPENID_CONNECT: "oidc",
  NONE: "none",
  AWS_LAMBDA: "lambda",
  // `LAMBDA` is an incorrect value that was added during the v6 rewrite.
  // Keeping it as a valid value until v7 to prevent breaking customers who might
  // be relying on it as a workaround.
  // ref: https://github.com/aws-amplify/amplify-js/pull/12922
  // TODO: @v7 remove next line
  LAMBDA: "lambda"
};
var parseAWSExports = (config = {}) => {
  if (!Object.prototype.hasOwnProperty.call(config, "aws_project_region")) {
    throw new AmplifyError({
      name: "InvalidParameterException",
      message: "Invalid config parameter.",
      recoverySuggestion: "Ensure passing the config object imported from  `amplifyconfiguration.json`."
    });
  }
  const { aws_appsync_apiKey, aws_appsync_authenticationType, aws_appsync_graphqlEndpoint, aws_appsync_region, aws_bots_config, aws_cognito_identity_pool_id, aws_cognito_sign_up_verification_method, aws_cognito_mfa_configuration, aws_cognito_mfa_types, aws_cognito_password_protection_settings, aws_cognito_verification_mechanisms, aws_cognito_signup_attributes, aws_cognito_social_providers, aws_cognito_username_attributes, aws_mandatory_sign_in, aws_mobile_analytics_app_id, aws_mobile_analytics_app_region, aws_user_files_s3_bucket, aws_user_files_s3_bucket_region, aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing, aws_user_pools_id, aws_user_pools_web_client_id, geo, oauth, predictions, aws_cloud_logic_custom, Notifications, modelIntrospection } = config;
  const amplifyConfig = {};
  if (aws_mobile_analytics_app_id) {
    amplifyConfig.Analytics = {
      Pinpoint: {
        appId: aws_mobile_analytics_app_id,
        region: aws_mobile_analytics_app_region
      }
    };
  }
  const { InAppMessaging, Push } = Notifications ?? {};
  if (InAppMessaging?.AWSPinpoint || Push?.AWSPinpoint) {
    if (InAppMessaging?.AWSPinpoint) {
      const { appId, region } = InAppMessaging.AWSPinpoint;
      amplifyConfig.Notifications = {
        InAppMessaging: {
          Pinpoint: {
            appId,
            region
          }
        }
      };
    }
    if (Push?.AWSPinpoint) {
      const { appId, region } = Push.AWSPinpoint;
      amplifyConfig.Notifications = __spreadProps(__spreadValues({}, amplifyConfig.Notifications), {
        PushNotification: {
          Pinpoint: {
            appId,
            region
          }
        }
      });
    }
  }
  if (Array.isArray(aws_bots_config)) {
    amplifyConfig.Interactions = {
      LexV1: Object.fromEntries(aws_bots_config.map((bot) => [bot.name, bot]))
    };
  }
  if (aws_appsync_graphqlEndpoint) {
    const defaultAuthMode = authTypeMapping[aws_appsync_authenticationType];
    if (!defaultAuthMode) {
      logger3.debug(`Invalid authentication type ${aws_appsync_authenticationType}. Falling back to IAM.`);
    }
    amplifyConfig.API = {
      GraphQL: {
        endpoint: aws_appsync_graphqlEndpoint,
        apiKey: aws_appsync_apiKey,
        region: aws_appsync_region,
        defaultAuthMode: defaultAuthMode ?? "iam"
      }
    };
    if (modelIntrospection) {
      amplifyConfig.API.GraphQL.modelIntrospection = modelIntrospection;
    }
  }
  const mfaConfig = aws_cognito_mfa_configuration ? {
    status: aws_cognito_mfa_configuration && aws_cognito_mfa_configuration.toLowerCase(),
    totpEnabled: aws_cognito_mfa_types?.includes("TOTP") ?? false,
    smsEnabled: aws_cognito_mfa_types?.includes("SMS") ?? false
  } : void 0;
  const passwordFormatConfig = aws_cognito_password_protection_settings ? {
    minLength: aws_cognito_password_protection_settings.passwordPolicyMinLength,
    requireLowercase: aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes("REQUIRES_LOWERCASE") ?? false,
    requireUppercase: aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes("REQUIRES_UPPERCASE") ?? false,
    requireNumbers: aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes("REQUIRES_NUMBERS") ?? false,
    requireSpecialCharacters: aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes("REQUIRES_SYMBOLS") ?? false
  } : void 0;
  const mergedUserAttributes = Array.from(/* @__PURE__ */ new Set([
    ...aws_cognito_verification_mechanisms ?? [],
    ...aws_cognito_signup_attributes ?? []
  ]));
  const userAttributes = mergedUserAttributes.reduce((attributes, key) => __spreadProps(__spreadValues({}, attributes), {
    // All user attributes generated by the CLI are required
    [key.toLowerCase()]: { required: true }
  }), {});
  const loginWithEmailEnabled = aws_cognito_username_attributes?.includes("EMAIL") ?? false;
  const loginWithPhoneEnabled = aws_cognito_username_attributes?.includes("PHONE_NUMBER") ?? false;
  if (aws_cognito_identity_pool_id || aws_user_pools_id) {
    amplifyConfig.Auth = {
      Cognito: {
        identityPoolId: aws_cognito_identity_pool_id,
        allowGuestAccess: aws_mandatory_sign_in !== "enable",
        signUpVerificationMethod: aws_cognito_sign_up_verification_method,
        userAttributes,
        userPoolClientId: aws_user_pools_web_client_id,
        userPoolId: aws_user_pools_id,
        mfa: mfaConfig,
        passwordFormat: passwordFormatConfig,
        loginWith: {
          username: !(loginWithEmailEnabled || loginWithPhoneEnabled),
          email: loginWithEmailEnabled,
          phone: loginWithPhoneEnabled
        }
      }
    };
  }
  const hasOAuthConfig = oauth ? Object.keys(oauth).length > 0 : false;
  const hasSocialProviderConfig = aws_cognito_social_providers ? aws_cognito_social_providers.length > 0 : false;
  if (amplifyConfig.Auth && hasOAuthConfig) {
    amplifyConfig.Auth.Cognito.loginWith = __spreadProps(__spreadValues({}, amplifyConfig.Auth.Cognito.loginWith), {
      oauth: __spreadValues(__spreadValues({}, getOAuthConfig(oauth)), hasSocialProviderConfig && {
        providers: parseSocialProviders(aws_cognito_social_providers)
      })
    });
  }
  if (aws_user_files_s3_bucket) {
    amplifyConfig.Storage = {
      S3: {
        bucket: aws_user_files_s3_bucket,
        region: aws_user_files_s3_bucket_region,
        dangerouslyConnectToHttpEndpointForTesting: aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing
      }
    };
  }
  if (geo) {
    const { amazon_location_service } = geo;
    amplifyConfig.Geo = {
      LocationService: {
        maps: amazon_location_service.maps,
        geofenceCollections: amazon_location_service.geofenceCollections,
        searchIndices: amazon_location_service.search_indices,
        region: amazon_location_service.region
      }
    };
  }
  if (aws_cloud_logic_custom) {
    amplifyConfig.API = __spreadProps(__spreadValues({}, amplifyConfig.API), {
      REST: aws_cloud_logic_custom.reduce((acc, api2) => {
        const { name, endpoint, region, service } = api2;
        return __spreadProps(__spreadValues({}, acc), {
          [name]: __spreadValues(__spreadValues({
            endpoint
          }, service ? { service } : void 0), region ? { region } : void 0)
        });
      }, {})
    });
  }
  if (predictions) {
    const { VoiceId: voiceId } = predictions?.convert?.speechGenerator?.defaults ?? {};
    amplifyConfig.Predictions = voiceId ? __spreadProps(__spreadValues({}, predictions), {
      convert: __spreadProps(__spreadValues({}, predictions.convert), {
        speechGenerator: __spreadProps(__spreadValues({}, predictions.convert.speechGenerator), {
          defaults: { voiceId }
        })
      })
    }) : predictions;
  }
  return amplifyConfig;
};
var getRedirectUrl = (redirectStr) => redirectStr?.split(",") ?? [];
var getOAuthConfig = ({ domain, scope, redirectSignIn, redirectSignOut, responseType }) => ({
  domain,
  scopes: scope,
  redirectSignIn: getRedirectUrl(redirectSignIn),
  redirectSignOut: getRedirectUrl(redirectSignOut),
  responseType
});
var parseSocialProviders = (aws_cognito_social_providers) => {
  return aws_cognito_social_providers.map((provider) => {
    const updatedProvider = provider.toLowerCase();
    return updatedProvider.charAt(0).toUpperCase() + updatedProvider.slice(1);
  });
};

// node_modules/@aws-amplify/core/dist/esm/parseAmplifyOutputs.mjs
function isAmplifyOutputs(config) {
  const { version: version2 } = config;
  if (!version2) {
    return false;
  }
  return version2.startsWith("1");
}
function parseStorage(amplifyOutputsStorageProperties) {
  if (!amplifyOutputsStorageProperties) {
    return void 0;
  }
  const { bucket_name, aws_region, buckets } = amplifyOutputsStorageProperties;
  return {
    S3: {
      bucket: bucket_name,
      region: aws_region,
      buckets: buckets && createBucketInfoMap(buckets)
    }
  };
}
function parseAuth(amplifyOutputsAuthProperties) {
  if (!amplifyOutputsAuthProperties) {
    return void 0;
  }
  const { user_pool_id, user_pool_client_id, identity_pool_id, password_policy, mfa_configuration, mfa_methods, unauthenticated_identities_enabled, oauth, username_attributes, standard_required_attributes, groups, passwordless } = amplifyOutputsAuthProperties;
  const authConfig = {
    Cognito: {
      userPoolId: user_pool_id,
      userPoolClientId: user_pool_client_id,
      groups
    }
  };
  if (identity_pool_id) {
    authConfig.Cognito = __spreadProps(__spreadValues({}, authConfig.Cognito), {
      identityPoolId: identity_pool_id
    });
  }
  if (password_policy) {
    authConfig.Cognito.passwordFormat = {
      requireLowercase: password_policy.require_lowercase,
      requireNumbers: password_policy.require_numbers,
      requireUppercase: password_policy.require_uppercase,
      requireSpecialCharacters: password_policy.require_symbols,
      minLength: password_policy.min_length ?? 6
    };
  }
  if (mfa_configuration) {
    authConfig.Cognito.mfa = {
      status: getMfaStatus(mfa_configuration),
      smsEnabled: mfa_methods?.includes("SMS"),
      totpEnabled: mfa_methods?.includes("TOTP")
    };
  }
  if (unauthenticated_identities_enabled) {
    authConfig.Cognito.allowGuestAccess = unauthenticated_identities_enabled;
  }
  if (oauth) {
    authConfig.Cognito.loginWith = {
      oauth: {
        domain: oauth.domain,
        redirectSignIn: oauth.redirect_sign_in_uri,
        redirectSignOut: oauth.redirect_sign_out_uri,
        responseType: oauth.response_type === "token" ? "token" : "code",
        scopes: oauth.scopes,
        providers: getOAuthProviders(oauth.identity_providers)
      }
    };
  }
  if (username_attributes) {
    authConfig.Cognito.loginWith = __spreadProps(__spreadValues({}, authConfig.Cognito.loginWith), {
      email: username_attributes.includes("email"),
      phone: username_attributes.includes("phone_number"),
      // Signing in with a username is not currently supported in Gen2, this should always evaluate to false
      username: username_attributes.includes("username")
    });
  }
  if (standard_required_attributes) {
    authConfig.Cognito.userAttributes = standard_required_attributes.reduce((acc, curr) => __spreadProps(__spreadValues({}, acc), { [curr]: { required: true } }), {});
  }
  if (passwordless) {
    authConfig.Cognito.passwordless = {
      emailOtpEnabled: passwordless.email_otp_enabled,
      smsOtpEnabled: passwordless.sms_otp_enabled,
      webAuthn: passwordless.web_authn ? {
        relyingPartyId: passwordless.web_authn.relying_party_id,
        userVerification: passwordless.web_authn.user_verification
      } : void 0,
      preferredChallenge: passwordless.preferred_challenge
    };
  }
  return authConfig;
}
function parseAnalytics(amplifyOutputsAnalyticsProperties) {
  if (!amplifyOutputsAnalyticsProperties?.amazon_pinpoint) {
    return void 0;
  }
  const { amazon_pinpoint } = amplifyOutputsAnalyticsProperties;
  return {
    Pinpoint: {
      appId: amazon_pinpoint.app_id,
      region: amazon_pinpoint.aws_region
    }
  };
}
function parseGeo(amplifyOutputsAnalyticsProperties) {
  if (!amplifyOutputsAnalyticsProperties) {
    return void 0;
  }
  const { aws_region, geofence_collections, maps, search_indices } = amplifyOutputsAnalyticsProperties;
  return {
    LocationService: {
      region: aws_region,
      searchIndices: search_indices,
      geofenceCollections: geofence_collections,
      maps
    }
  };
}
function parseData(amplifyOutputsDataProperties) {
  if (!amplifyOutputsDataProperties) {
    return void 0;
  }
  const { aws_region, default_authorization_type, url, api_key, model_introspection } = amplifyOutputsDataProperties;
  const GraphQL = {
    endpoint: url,
    defaultAuthMode: getGraphQLAuthMode(default_authorization_type),
    region: aws_region,
    apiKey: api_key,
    modelIntrospection: model_introspection
  };
  return {
    GraphQL
  };
}
function parseCustom(amplifyOutputsCustomProperties) {
  if (!amplifyOutputsCustomProperties?.events) {
    return void 0;
  }
  const { url, aws_region, api_key, default_authorization_type } = amplifyOutputsCustomProperties.events;
  const Events = {
    endpoint: url,
    defaultAuthMode: getGraphQLAuthMode(default_authorization_type),
    region: aws_region,
    apiKey: api_key
  };
  return {
    Events
  };
}
function parseNotifications(amplifyOutputsNotificationsProperties) {
  if (!amplifyOutputsNotificationsProperties) {
    return void 0;
  }
  const { aws_region, channels, amazon_pinpoint_app_id } = amplifyOutputsNotificationsProperties;
  const hasInAppMessaging = channels.includes("IN_APP_MESSAGING");
  const hasPushNotification = channels.includes("APNS") || channels.includes("FCM");
  if (!(hasInAppMessaging || hasPushNotification)) {
    return void 0;
  }
  const notificationsConfig = {};
  if (hasInAppMessaging) {
    notificationsConfig.InAppMessaging = {
      Pinpoint: {
        appId: amazon_pinpoint_app_id,
        region: aws_region
      }
    };
  }
  if (hasPushNotification) {
    notificationsConfig.PushNotification = {
      Pinpoint: {
        appId: amazon_pinpoint_app_id,
        region: aws_region
      }
    };
  }
  return notificationsConfig;
}
function parseAmplifyOutputs(amplifyOutputs) {
  const resourcesConfig = {};
  if (amplifyOutputs.storage) {
    resourcesConfig.Storage = parseStorage(amplifyOutputs.storage);
  }
  if (amplifyOutputs.auth) {
    resourcesConfig.Auth = parseAuth(amplifyOutputs.auth);
  }
  if (amplifyOutputs.analytics) {
    resourcesConfig.Analytics = parseAnalytics(amplifyOutputs.analytics);
  }
  if (amplifyOutputs.geo) {
    resourcesConfig.Geo = parseGeo(amplifyOutputs.geo);
  }
  if (amplifyOutputs.data) {
    resourcesConfig.API = parseData(amplifyOutputs.data);
  }
  if (amplifyOutputs.custom) {
    const customConfig = parseCustom(amplifyOutputs.custom);
    if (customConfig && "Events" in customConfig) {
      resourcesConfig.API = __spreadValues(__spreadValues({}, resourcesConfig.API), customConfig);
    }
  }
  if (amplifyOutputs.notifications) {
    resourcesConfig.Notifications = parseNotifications(amplifyOutputs.notifications);
  }
  return resourcesConfig;
}
var authModeNames = {
  AMAZON_COGNITO_USER_POOLS: "userPool",
  API_KEY: "apiKey",
  AWS_IAM: "iam",
  AWS_LAMBDA: "lambda",
  OPENID_CONNECT: "oidc"
};
function getGraphQLAuthMode(authType) {
  return authModeNames[authType];
}
var providerNames = {
  GOOGLE: "Google",
  LOGIN_WITH_AMAZON: "Amazon",
  FACEBOOK: "Facebook",
  SIGN_IN_WITH_APPLE: "Apple"
};
function getOAuthProviders(providers = []) {
  return providers.reduce((oAuthProviders, provider) => {
    if (providerNames[provider] !== void 0) {
      oAuthProviders.push(providerNames[provider]);
    }
    return oAuthProviders;
  }, []);
}
function getMfaStatus(mfaConfiguration) {
  if (mfaConfiguration === "OPTIONAL")
    return "optional";
  if (mfaConfiguration === "REQUIRED")
    return "on";
  return "off";
}
function createBucketInfoMap(buckets) {
  const mappedBuckets = {};
  buckets.forEach(({ name, bucket_name: bucketName, aws_region: region, paths }) => {
    if (name in mappedBuckets) {
      throw new Error(`Duplicate friendly name found: ${name}. Name must be unique.`);
    }
    const sanitizedPaths = paths ? Object.entries(paths).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = value;
      }
      return acc;
    }, {}) : void 0;
    mappedBuckets[name] = {
      bucketName,
      region,
      paths: sanitizedPaths
    };
  });
  return mappedBuckets;
}

// node_modules/@aws-amplify/core/dist/esm/singleton/constants.mjs
var ADD_OAUTH_LISTENER = Symbol("oauth-listener");

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default = validate;

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  return Uint8Array.of((v = parseInt(uuid.slice(0, 8), 16)) >>> 24, v >>> 16 & 255, v >>> 8 & 255, v & 255, (v = parseInt(uuid.slice(9, 13), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(14, 18), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(19, 23), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255, v / 4294967296 & 255, v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255);
}
var parse_default = parse;

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/md5.js
function md5(bytes) {
  const words = uint8ToUint32(bytes);
  const md5Bytes = wordsToMd5(words, bytes.length * 8);
  return uint32ToUint8(md5Bytes);
}
function uint32ToUint8(input) {
  const bytes = new Uint8Array(input.length * 4);
  for (let i = 0; i < input.length * 4; i++) {
    bytes[i] = input[i >> 2] >>> i % 4 * 8 & 255;
  }
  return bytes;
}
function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
function wordsToMd5(x, len) {
  const xpad = new Uint32Array(getOutputLength(len)).fill(0);
  xpad.set(x);
  xpad[len >> 5] |= 128 << len % 32;
  xpad[xpad.length - 1] = len;
  x = xpad;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return Uint32Array.of(a, b, c, d);
}
function uint8ToUint32(input) {
  if (input.length === 0) {
    return new Uint32Array();
  }
  const output = new Uint32Array(getOutputLength(input.length * 8)).fill(0);
  for (let i = 0; i < input.length; i++) {
    output[i >> 2] |= (input[i] & 255) << i % 4 * 8;
  }
  return output;
}
function safeAdd(x, y) {
  const lsw = (x & 65535) + (y & 65535);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
var md5_default = md5;

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}
var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
var URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function v35(version2, hash, value, namespace, buf, offset) {
  const valueBytes = typeof value === "string" ? stringToBytes(value) : value;
  const namespaceBytes = typeof namespace === "string" ? parse_default(namespace) : namespace;
  if (typeof namespace === "string") {
    namespace = parse_default(namespace);
  }
  if (namespace?.length !== 16) {
    throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
  }
  let bytes = new Uint8Array(16 + valueBytes.length);
  bytes.set(namespaceBytes);
  bytes.set(valueBytes, namespaceBytes.length);
  bytes = hash(bytes);
  bytes[6] = bytes[6] & 15 | version2;
  bytes[8] = bytes[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = bytes[i];
    }
    return buf;
  }
  return unsafeStringify(bytes);
}

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/v3.js
function v3(value, namespace, buf, offset) {
  return v35(48, md5_default, value, namespace, buf, offset);
}
v3.DNS = DNS;
v3.URL = URL2;

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = { randomUUID };

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/sha1.js
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;
    case 1:
      return x ^ y ^ z;
    case 2:
      return x & y ^ x & z ^ y & z;
    case 3:
      return x ^ y ^ z;
  }
}
function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}
function sha1(bytes) {
  const K = [1518500249, 1859775393, 2400959708, 3395469782];
  const H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  const newBytes = new Uint8Array(bytes.length + 1);
  newBytes.set(bytes);
  newBytes[bytes.length] = 128;
  bytes = newBytes;
  const l = bytes.length / 4 + 2;
  const N = Math.ceil(l / 16);
  const M = new Array(N);
  for (let i = 0; i < N; ++i) {
    const arr = new Uint32Array(16);
    for (let j = 0; j < 16; ++j) {
      arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }
    M[i] = arr;
  }
  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
  for (let i = 0; i < N; ++i) {
    const W = new Uint32Array(80);
    for (let t = 0; t < 16; ++t) {
      W[t] = M[i][t];
    }
    for (let t = 16; t < 80; ++t) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }
    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    for (let t = 0; t < 80; ++t) {
      const s = Math.floor(t / 20);
      const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }
    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }
  return Uint8Array.of(H[0] >> 24, H[0] >> 16, H[0] >> 8, H[0], H[1] >> 24, H[1] >> 16, H[1] >> 8, H[1], H[2] >> 24, H[2] >> 16, H[2] >> 8, H[2], H[3] >> 24, H[3] >> 16, H[3] >> 8, H[3], H[4] >> 24, H[4] >> 16, H[4] >> 8, H[4]);
}
var sha1_default = sha1;

// node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/v5.js
function v5(value, namespace, buf, offset) {
  return v35(80, sha1_default, value, namespace, buf, offset);
}
v5.DNS = DNS;
v5.URL = URL2;

// node_modules/@aws-amplify/core/dist/esm/utils/amplifyUuid/index.mjs
var amplifyUuid = v4_default;

// node_modules/@aws-amplify/core/dist/esm/utils/amplifyUrl/index.mjs
var AmplifyUrl = URL;
var AmplifyUrlSearchParams = URLSearchParams;

// node_modules/@aws-amplify/core/dist/esm/utils/parseAmplifyConfig.mjs
var parseAmplifyConfig = (amplifyConfig) => {
  if (Object.keys(amplifyConfig).some((key) => key.startsWith("aws_"))) {
    return parseAWSExports(amplifyConfig);
  } else if (isAmplifyOutputs(amplifyConfig)) {
    return parseAmplifyOutputs(amplifyConfig);
  } else {
    return amplifyConfig;
  }
};

// node_modules/@aws-amplify/core/dist/esm/utils/deviceName/getDeviceName.mjs
var getDeviceName = () => __async(void 0, null, function* () {
  const { userAgentData } = navigator;
  if (!userAgentData)
    return navigator.userAgent;
  const { platform = "", platformVersion = "", model = "", architecture = "", fullVersionList = [] } = yield userAgentData.getHighEntropyValues([
    "platform",
    "platformVersion",
    "architecture",
    "model",
    "fullVersionList"
  ]);
  const versionList = fullVersionList.map((v) => `${v.brand}/${v.version}`).join(";");
  const deviceName = [
    platform,
    platformVersion,
    architecture,
    model,
    platform,
    versionList
  ].filter((value) => value).join(" ");
  return deviceName || navigator.userAgent;
});

// node_modules/@aws-amplify/core/dist/esm/utils/convert/base64/base64Decoder.mjs
var base64Decoder = {
  convert(input, options) {
    let inputStr = input;
    if (options?.urlSafe) {
      inputStr = inputStr.replace(/-/g, "+").replace(/_/g, "/");
    }
    return getAtob()(inputStr);
  }
};

// node_modules/@aws-amplify/core/dist/esm/singleton/Auth/utils/errorHelpers.mjs
var AuthConfigurationErrorCode;
(function(AuthConfigurationErrorCode2) {
  AuthConfigurationErrorCode2["AuthTokenConfigException"] = "AuthTokenConfigException";
  AuthConfigurationErrorCode2["AuthUserPoolAndIdentityPoolException"] = "AuthUserPoolAndIdentityPoolException";
  AuthConfigurationErrorCode2["AuthUserPoolException"] = "AuthUserPoolException";
  AuthConfigurationErrorCode2["InvalidIdentityPoolIdException"] = "InvalidIdentityPoolIdException";
  AuthConfigurationErrorCode2["OAuthNotConfigureException"] = "OAuthNotConfigureException";
})(AuthConfigurationErrorCode || (AuthConfigurationErrorCode = {}));
var authConfigurationErrorMap = {
  [AuthConfigurationErrorCode.AuthTokenConfigException]: {
    message: "Auth Token Provider not configured.",
    recoverySuggestion: "Make sure to call Amplify.configure in your app."
  },
  [AuthConfigurationErrorCode.AuthUserPoolAndIdentityPoolException]: {
    message: "Auth UserPool or IdentityPool not configured.",
    recoverySuggestion: "Make sure to call Amplify.configure in your app with UserPoolId and IdentityPoolId."
  },
  [AuthConfigurationErrorCode.AuthUserPoolException]: {
    message: "Auth UserPool not configured.",
    recoverySuggestion: "Make sure to call Amplify.configure in your app with userPoolId and userPoolClientId."
  },
  [AuthConfigurationErrorCode.InvalidIdentityPoolIdException]: {
    message: "Invalid identity pool id provided.",
    recoverySuggestion: "Make sure a valid identityPoolId is given in the config."
  },
  [AuthConfigurationErrorCode.OAuthNotConfigureException]: {
    message: "oauth param not configured.",
    recoverySuggestion: "Make sure to call Amplify.configure with oauth parameter in your app."
  }
};
var assert2 = createAssertionFunction(authConfigurationErrorMap);

// node_modules/@aws-amplify/core/dist/esm/singleton/Auth/utils/index.mjs
function assertTokenProviderConfig(cognitoConfig) {
  let assertionValid = true;
  if (!cognitoConfig) {
    assertionValid = false;
  } else {
    assertionValid = !!cognitoConfig.userPoolId && !!cognitoConfig.userPoolClientId;
  }
  assert2(assertionValid, AuthConfigurationErrorCode.AuthUserPoolException);
}
function assertOAuthConfig(cognitoConfig) {
  const validOAuthConfig = !!cognitoConfig?.loginWith?.oauth?.domain && !!cognitoConfig?.loginWith?.oauth?.redirectSignOut && !!cognitoConfig?.loginWith?.oauth?.redirectSignIn && !!cognitoConfig?.loginWith?.oauth?.responseType;
  assert2(validOAuthConfig, AuthConfigurationErrorCode.OAuthNotConfigureException);
}
function assertIdentityPoolIdConfig(cognitoConfig) {
  const validConfig = !!cognitoConfig?.identityPoolId;
  assert2(validConfig, AuthConfigurationErrorCode.InvalidIdentityPoolIdException);
}
function decodeJWT(token) {
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    throw new Error("Invalid token");
  }
  try {
    const base64WithUrlSafe = tokenParts[1];
    const base64 = base64WithUrlSafe.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = decodeURIComponent(base64Decoder.convert(base64).split("").map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`).join(""));
    const payload = JSON.parse(jsonStr);
    return {
      toString: () => token,
      payload
    };
  } catch (err) {
    throw new Error("Invalid token payload");
  }
}

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getSignedHeaders.mjs
var getSignedHeaders = (headers) => Object.keys(headers).map((key) => key.toLowerCase()).sort().join(";");

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/constants.mjs
var AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
var TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
var AUTH_HEADER = "authorization";
var HOST_HEADER = "host";
var AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
var TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();
var KEY_TYPE_IDENTIFIER = "aws4_request";
var SHA256_ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256";
var SIGNATURE_IDENTIFIER = "AWS4";
var EMPTY_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
var UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getCredentialScope.mjs
var getCredentialScope = (date, region, service) => `${date}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`;

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getFormattedDates.mjs
var getFormattedDates = (date) => {
  const longDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    longDate,
    shortDate: longDate.slice(0, 8)
  };
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getSigningValues.mjs
var getSigningValues = ({ credentials, signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService, uriEscapePath = true }) => {
  const { accessKeyId, secretAccessKey, sessionToken } = credentials;
  const { longDate, shortDate } = getFormattedDates(signingDate);
  const credentialScope = getCredentialScope(shortDate, signingRegion, signingService);
  return {
    accessKeyId,
    credentialScope,
    longDate,
    secretAccessKey,
    sessionToken,
    shortDate,
    signingRegion,
    signingService,
    uriEscapePath
  };
};

// node_modules/@aws-crypto/sha256-js/build/module/constants.js
var BLOCK_SIZE = 64;
var DIGEST_LENGTH = 32;
var KEY = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var INIT = [
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
];
var MAX_HASHABLE_LENGTH = Math.pow(2, 53) - 1;

// node_modules/@aws-crypto/sha256-js/build/module/RawSha256.js
var RawSha256 = (
  /** @class */
  function() {
    function RawSha2562() {
      this.state = Int32Array.from(INIT);
      this.temp = new Int32Array(64);
      this.buffer = new Uint8Array(64);
      this.bufferLength = 0;
      this.bytesHashed = 0;
      this.finished = false;
    }
    RawSha2562.prototype.update = function(data) {
      if (this.finished) {
        throw new Error("Attempted to update an already finished hash.");
      }
      var position = 0;
      var byteLength = data.byteLength;
      this.bytesHashed += byteLength;
      if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) {
        throw new Error("Cannot hash more than 2^53 - 1 bits");
      }
      while (byteLength > 0) {
        this.buffer[this.bufferLength++] = data[position++];
        byteLength--;
        if (this.bufferLength === BLOCK_SIZE) {
          this.hashBuffer();
          this.bufferLength = 0;
        }
      }
    };
    RawSha2562.prototype.digest = function() {
      if (!this.finished) {
        var bitsHashed = this.bytesHashed * 8;
        var bufferView = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
        var undecoratedLength = this.bufferLength;
        bufferView.setUint8(this.bufferLength++, 128);
        if (undecoratedLength % BLOCK_SIZE >= BLOCK_SIZE - 8) {
          for (var i = this.bufferLength; i < BLOCK_SIZE; i++) {
            bufferView.setUint8(i, 0);
          }
          this.hashBuffer();
          this.bufferLength = 0;
        }
        for (var i = this.bufferLength; i < BLOCK_SIZE - 8; i++) {
          bufferView.setUint8(i, 0);
        }
        bufferView.setUint32(BLOCK_SIZE - 8, Math.floor(bitsHashed / 4294967296), true);
        bufferView.setUint32(BLOCK_SIZE - 4, bitsHashed);
        this.hashBuffer();
        this.finished = true;
      }
      var out = new Uint8Array(DIGEST_LENGTH);
      for (var i = 0; i < 8; i++) {
        out[i * 4] = this.state[i] >>> 24 & 255;
        out[i * 4 + 1] = this.state[i] >>> 16 & 255;
        out[i * 4 + 2] = this.state[i] >>> 8 & 255;
        out[i * 4 + 3] = this.state[i] >>> 0 & 255;
      }
      return out;
    };
    RawSha2562.prototype.hashBuffer = function() {
      var _a = this, buffer = _a.buffer, state = _a.state;
      var state0 = state[0], state1 = state[1], state2 = state[2], state3 = state[3], state4 = state[4], state5 = state[5], state6 = state[6], state7 = state[7];
      for (var i = 0; i < BLOCK_SIZE; i++) {
        if (i < 16) {
          this.temp[i] = (buffer[i * 4] & 255) << 24 | (buffer[i * 4 + 1] & 255) << 16 | (buffer[i * 4 + 2] & 255) << 8 | buffer[i * 4 + 3] & 255;
        } else {
          var u = this.temp[i - 2];
          var t1_1 = (u >>> 17 | u << 15) ^ (u >>> 19 | u << 13) ^ u >>> 10;
          u = this.temp[i - 15];
          var t2_1 = (u >>> 7 | u << 25) ^ (u >>> 18 | u << 14) ^ u >>> 3;
          this.temp[i] = (t1_1 + this.temp[i - 7] | 0) + (t2_1 + this.temp[i - 16] | 0);
        }
        var t1 = (((state4 >>> 6 | state4 << 26) ^ (state4 >>> 11 | state4 << 21) ^ (state4 >>> 25 | state4 << 7)) + (state4 & state5 ^ ~state4 & state6) | 0) + (state7 + (KEY[i] + this.temp[i] | 0) | 0) | 0;
        var t2 = ((state0 >>> 2 | state0 << 30) ^ (state0 >>> 13 | state0 << 19) ^ (state0 >>> 22 | state0 << 10)) + (state0 & state1 ^ state0 & state2 ^ state1 & state2) | 0;
        state7 = state6;
        state6 = state5;
        state5 = state4;
        state4 = state3 + t1 | 0;
        state3 = state2;
        state2 = state1;
        state1 = state0;
        state0 = t1 + t2 | 0;
      }
      state[0] += state0;
      state[1] += state1;
      state[2] += state2;
      state[3] += state3;
      state[4] += state4;
      state[5] += state5;
      state[6] += state6;
      state[7] += state7;
    };
    return RawSha2562;
  }()
);

// node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js
var fromUtf8 = (input) => new TextEncoder().encode(input);

// node_modules/@aws-crypto/util/build/module/convertToBuffer.js
var fromUtf82 = typeof Buffer !== "undefined" && Buffer.from ? function(input) {
  return Buffer.from(input, "utf8");
} : fromUtf8;
function convertToBuffer(data) {
  if (data instanceof Uint8Array)
    return data;
  if (typeof data === "string") {
    return fromUtf82(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  return new Uint8Array(data);
}

// node_modules/@aws-crypto/util/build/module/isEmptyData.js
function isEmptyData(data) {
  if (typeof data === "string") {
    return data.length === 0;
  }
  return data.byteLength === 0;
}

// node_modules/@aws-crypto/sha256-js/build/module/jsSha256.js
var Sha256 = (
  /** @class */
  function() {
    function Sha2562(secret) {
      this.secret = secret;
      this.hash = new RawSha256();
      this.reset();
    }
    Sha2562.prototype.update = function(toHash) {
      if (isEmptyData(toHash) || this.error) {
        return;
      }
      try {
        this.hash.update(convertToBuffer(toHash));
      } catch (e) {
        this.error = e;
      }
    };
    Sha2562.prototype.digestSync = function() {
      if (this.error) {
        throw this.error;
      }
      if (this.outer) {
        if (!this.outer.finished) {
          this.outer.update(this.hash.digest());
        }
        return this.outer.digest();
      }
      return this.hash.digest();
    };
    Sha2562.prototype.digest = function() {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          return [2, this.digestSync()];
        });
      });
    };
    Sha2562.prototype.reset = function() {
      this.hash = new RawSha256();
      if (this.secret) {
        this.outer = new RawSha256();
        var inner = bufferFromSecret(this.secret);
        var outer = new Uint8Array(BLOCK_SIZE);
        outer.set(inner);
        for (var i = 0; i < BLOCK_SIZE; i++) {
          inner[i] ^= 54;
          outer[i] ^= 92;
        }
        this.hash.update(inner);
        this.outer.update(outer);
        for (var i = 0; i < inner.byteLength; i++) {
          inner[i] = 0;
        }
      }
    };
    return Sha2562;
  }()
);
function bufferFromSecret(secret) {
  var input = convertToBuffer(secret);
  if (input.byteLength > BLOCK_SIZE) {
    var bufferHash = new RawSha256();
    bufferHash.update(input);
    input = bufferHash.digest();
  }
  var buffer = new Uint8Array(BLOCK_SIZE);
  buffer.set(input);
  return buffer;
}

// node_modules/@smithy/util-hex-encoding/dist-es/index.js
var SHORT_TO_HEX = {};
var HEX_TO_SHORT = {};
for (let i = 0; i < 256; i++) {
  let encodedByte = i.toString(16).toLowerCase();
  if (encodedByte.length === 1) {
    encodedByte = `0${encodedByte}`;
  }
  SHORT_TO_HEX[i] = encodedByte;
  HEX_TO_SHORT[encodedByte] = i;
}
function toHex(bytes) {
  let out = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    out += SHORT_TO_HEX[bytes[i]];
  }
  return out;
}

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/dataHashHelpers.mjs
var getHashedData = (key, data) => {
  const sha256 = new Sha256(key ?? void 0);
  sha256.update(data);
  const hashedData = sha256.digestSync();
  return hashedData;
};
var getHashedDataAsHex = (key, data) => {
  const hashedData = getHashedData(key, data);
  return toHex(hashedData);
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getCanonicalHeaders.mjs
var getCanonicalHeaders = (headers) => Object.entries(headers).map(([key, value]) => ({
  key: key.toLowerCase(),
  value: value?.trim().replace(/\s+/g, " ") ?? ""
})).sort((a, b) => a.key < b.key ? -1 : 1).map((entry) => `${entry.key}:${entry.value}
`).join("");

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getCanonicalQueryString.mjs
var getCanonicalQueryString = (searchParams) => Array.from(searchParams).sort(([keyA, valA], [keyB, valB]) => {
  if (keyA === keyB) {
    return valA < valB ? -1 : 1;
  }
  return keyA < keyB ? -1 : 1;
}).map(([key, val]) => `${escapeUri(key)}=${escapeUri(val)}`).join("&");
var escapeUri = (uri) => encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);
var hexEncode = (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`;

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getCanonicalUri.mjs
var getCanonicalUri = (pathname, uriEscapePath = true) => pathname ? uriEscapePath ? encodeURIComponent(pathname).replace(/%2F/g, "/") : pathname : "/";

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getHashedPayload.mjs
var getHashedPayload = (body) => {
  if (body == null) {
    return EMPTY_HASH;
  }
  if (isSourceData(body)) {
    const hashedData = getHashedDataAsHex(null, body);
    return hashedData;
  }
  return UNSIGNED_PAYLOAD;
};
var isSourceData = (body) => (
  // Exclude UNSIGNED_PAYLOAD constant to prevent it from being hashed as a string
  body !== UNSIGNED_PAYLOAD && (typeof body === "string" || ArrayBuffer.isView(body) || isArrayBuffer(body))
);
var isArrayBuffer = (arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]";

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getCanonicalRequest.mjs
var getCanonicalRequest = ({ body, headers, method, url }, uriEscapePath = true) => [
  method,
  getCanonicalUri(url.pathname, uriEscapePath),
  getCanonicalQueryString(url.searchParams),
  getCanonicalHeaders(headers),
  getSignedHeaders(headers),
  getHashedPayload(body)
].join("\n");

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getSigningKey.mjs
var getSigningKey = (secretAccessKey, date, region, service) => {
  const key = `${SIGNATURE_IDENTIFIER}${secretAccessKey}`;
  const dateKey = getHashedData(key, date);
  const regionKey = getHashedData(dateKey, region);
  const serviceKey = getHashedData(regionKey, service);
  const signingKey = getHashedData(serviceKey, KEY_TYPE_IDENTIFIER);
  return signingKey;
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getStringToSign.mjs
var getStringToSign = (date, credentialScope, hashedRequest) => [SHA256_ALGORITHM_IDENTIFIER, date, credentialScope, hashedRequest].join("\n");

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/utils/getSignature.mjs
var getSignature = (request, { credentialScope, longDate, secretAccessKey, shortDate, signingRegion, signingService, uriEscapePath }) => {
  const canonicalRequest = getCanonicalRequest(request, uriEscapePath);
  const hashedRequest = getHashedDataAsHex(null, canonicalRequest);
  const stringToSign = getStringToSign(longDate, credentialScope, hashedRequest);
  const signature = getHashedDataAsHex(getSigningKey(secretAccessKey, shortDate, signingRegion, signingService), stringToSign);
  return signature;
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/signer/signatureV4/signRequest.mjs
var signRequest = (request, options) => {
  const signingValues = getSigningValues(options);
  const { accessKeyId, credentialScope, longDate, sessionToken } = signingValues;
  const headers = __spreadValues({}, request.headers);
  headers[HOST_HEADER] = request.url.host;
  headers[AMZ_DATE_HEADER] = longDate;
  if (sessionToken) {
    headers[TOKEN_HEADER] = sessionToken;
  }
  const requestToSign = __spreadProps(__spreadValues({}, request), { headers });
  const signature = getSignature(requestToSign, signingValues);
  const credentialEntry = `Credential=${accessKeyId}/${credentialScope}`;
  const signedHeadersEntry = `SignedHeaders=${getSignedHeaders(headers)}`;
  const signatureEntry = `Signature=${signature}`;
  headers[AUTH_HEADER] = `${SHA256_ALGORITHM_IDENTIFIER} ${credentialEntry}, ${signedHeadersEntry}, ${signatureEntry}`;
  return requestToSign;
};

// node_modules/@aws-amplify/core/dist/esm/Signer/DateUtils.mjs
var FIVE_MINUTES_IN_MS = 1e3 * 60 * 5;

// node_modules/@aws-amplify/core/dist/esm/Platform/types.mjs
var Framework;
(function(Framework2) {
  Framework2["WebUnknown"] = "0";
  Framework2["React"] = "1";
  Framework2["NextJs"] = "2";
  Framework2["Angular"] = "3";
  Framework2["VueJs"] = "4";
  Framework2["Nuxt"] = "5";
  Framework2["Svelte"] = "6";
  Framework2["ServerSideUnknown"] = "100";
  Framework2["ReactSSR"] = "101";
  Framework2["NextJsSSR"] = "102";
  Framework2["AngularSSR"] = "103";
  Framework2["VueJsSSR"] = "104";
  Framework2["NuxtSSR"] = "105";
  Framework2["SvelteSSR"] = "106";
  Framework2["ReactNative"] = "201";
  Framework2["Expo"] = "202";
})(Framework || (Framework = {}));
var Category;
(function(Category2) {
  Category2["AI"] = "ai";
  Category2["API"] = "api";
  Category2["Auth"] = "auth";
  Category2["Analytics"] = "analytics";
  Category2["DataStore"] = "datastore";
  Category2["Geo"] = "geo";
  Category2["InAppMessaging"] = "inappmessaging";
  Category2["Interactions"] = "interactions";
  Category2["Predictions"] = "predictions";
  Category2["PubSub"] = "pubsub";
  Category2["PushNotification"] = "pushnotification";
  Category2["Storage"] = "storage";
})(Category || (Category = {}));
var AiAction;
(function(AiAction2) {
  AiAction2["CreateConversation"] = "1";
  AiAction2["GetConversation"] = "2";
  AiAction2["ListConversations"] = "3";
  AiAction2["DeleteConversation"] = "4";
  AiAction2["SendMessage"] = "5";
  AiAction2["ListMessages"] = "6";
  AiAction2["OnMessage"] = "7";
  AiAction2["Generation"] = "8";
  AiAction2["UpdateConversation"] = "9";
})(AiAction || (AiAction = {}));
var AnalyticsAction;
(function(AnalyticsAction2) {
  AnalyticsAction2["Record"] = "1";
  AnalyticsAction2["IdentifyUser"] = "2";
})(AnalyticsAction || (AnalyticsAction = {}));
var ApiAction;
(function(ApiAction2) {
  ApiAction2["GraphQl"] = "1";
  ApiAction2["Get"] = "2";
  ApiAction2["Post"] = "3";
  ApiAction2["Put"] = "4";
  ApiAction2["Patch"] = "5";
  ApiAction2["Del"] = "6";
  ApiAction2["Head"] = "7";
})(ApiAction || (ApiAction = {}));
var AuthAction;
(function(AuthAction2) {
  AuthAction2["SignUp"] = "1";
  AuthAction2["ConfirmSignUp"] = "2";
  AuthAction2["ResendSignUpCode"] = "3";
  AuthAction2["SignIn"] = "4";
  AuthAction2["FetchMFAPreference"] = "6";
  AuthAction2["UpdateMFAPreference"] = "7";
  AuthAction2["SetUpTOTP"] = "10";
  AuthAction2["VerifyTOTPSetup"] = "11";
  AuthAction2["ConfirmSignIn"] = "12";
  AuthAction2["DeleteUserAttributes"] = "15";
  AuthAction2["DeleteUser"] = "16";
  AuthAction2["UpdateUserAttributes"] = "17";
  AuthAction2["FetchUserAttributes"] = "18";
  AuthAction2["ConfirmUserAttribute"] = "22";
  AuthAction2["SignOut"] = "26";
  AuthAction2["UpdatePassword"] = "27";
  AuthAction2["ResetPassword"] = "28";
  AuthAction2["ConfirmResetPassword"] = "29";
  AuthAction2["FederatedSignIn"] = "30";
  AuthAction2["RememberDevice"] = "32";
  AuthAction2["ForgetDevice"] = "33";
  AuthAction2["FetchDevices"] = "34";
  AuthAction2["SendUserAttributeVerificationCode"] = "35";
  AuthAction2["SignInWithRedirect"] = "36";
  AuthAction2["StartWebAuthnRegistration"] = "37";
  AuthAction2["CompleteWebAuthnRegistration"] = "38";
  AuthAction2["ListWebAuthnCredentials"] = "39";
  AuthAction2["DeleteWebAuthnCredential"] = "40";
})(AuthAction || (AuthAction = {}));
var DataStoreAction;
(function(DataStoreAction2) {
  DataStoreAction2["Subscribe"] = "1";
  DataStoreAction2["GraphQl"] = "2";
})(DataStoreAction || (DataStoreAction = {}));
var GeoAction;
(function(GeoAction2) {
  GeoAction2["SearchByText"] = "0";
  GeoAction2["SearchByCoordinates"] = "1";
  GeoAction2["SearchForSuggestions"] = "2";
  GeoAction2["SearchByPlaceId"] = "3";
  GeoAction2["SaveGeofences"] = "4";
  GeoAction2["GetGeofence"] = "5";
  GeoAction2["ListGeofences"] = "6";
  GeoAction2["DeleteGeofences"] = "7";
})(GeoAction || (GeoAction = {}));
var InAppMessagingAction;
(function(InAppMessagingAction2) {
  InAppMessagingAction2["SyncMessages"] = "1";
  InAppMessagingAction2["IdentifyUser"] = "2";
  InAppMessagingAction2["NotifyMessageInteraction"] = "3";
})(InAppMessagingAction || (InAppMessagingAction = {}));
var InteractionsAction;
(function(InteractionsAction2) {
  InteractionsAction2["None"] = "0";
})(InteractionsAction || (InteractionsAction = {}));
var PredictionsAction;
(function(PredictionsAction2) {
  PredictionsAction2["Convert"] = "1";
  PredictionsAction2["Identify"] = "2";
  PredictionsAction2["Interpret"] = "3";
})(PredictionsAction || (PredictionsAction = {}));
var PubSubAction;
(function(PubSubAction2) {
  PubSubAction2["Subscribe"] = "1";
})(PubSubAction || (PubSubAction = {}));
var PushNotificationAction;
(function(PushNotificationAction2) {
  PushNotificationAction2["InitializePushNotifications"] = "1";
  PushNotificationAction2["IdentifyUser"] = "2";
})(PushNotificationAction || (PushNotificationAction = {}));
var StorageAction;
(function(StorageAction2) {
  StorageAction2["UploadData"] = "1";
  StorageAction2["DownloadData"] = "2";
  StorageAction2["List"] = "3";
  StorageAction2["Copy"] = "4";
  StorageAction2["Remove"] = "5";
  StorageAction2["GetProperties"] = "6";
  StorageAction2["GetUrl"] = "7";
  StorageAction2["GetDataAccess"] = "8";
  StorageAction2["ListCallerAccessGrants"] = "9";
})(StorageAction || (StorageAction = {}));

// node_modules/@aws-amplify/core/dist/esm/Platform/version.mjs
var version = "6.16.2";

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/helpers.mjs
var globalExists = () => {
  return typeof global !== "undefined";
};
var windowExists = () => {
  return typeof window !== "undefined";
};
var documentExists = () => {
  return typeof document !== "undefined";
};
var processExists = () => {
  return typeof process !== "undefined";
};
var keyPrefixMatch = (object, prefix) => {
  return !!Object.keys(object).find((key) => key.startsWith(prefix));
};

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/React.mjs
function reactWebDetect() {
  const elementKeyPrefixedWithReact = (key) => {
    return key.startsWith("_react") || key.startsWith("__react");
  };
  const elementIsReactEnabled = (element) => {
    return Object.keys(element).find(elementKeyPrefixedWithReact);
  };
  const allElementsWithId = () => Array.from(document.querySelectorAll("[id]"));
  return documentExists() && allElementsWithId().some(elementIsReactEnabled);
}
function reactSSRDetect() {
  return processExists() && typeof process.env !== "undefined" && !!Object.keys(process.env).find((key) => key.includes("react"));
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/Vue.mjs
function vueWebDetect() {
  return windowExists() && keyPrefixMatch(window, "__VUE");
}
function vueSSRDetect() {
  return globalExists() && keyPrefixMatch(global, "__VUE");
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/Svelte.mjs
function svelteWebDetect() {
  return windowExists() && keyPrefixMatch(window, "__SVELTE");
}
function svelteSSRDetect() {
  return processExists() && typeof process.env !== "undefined" && !!Object.keys(process.env).find((key) => key.includes("svelte"));
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/Next.mjs
function nextWebDetect() {
  return windowExists() && window.next && typeof window.next === "object";
}
function nextSSRDetect() {
  return globalExists() && (keyPrefixMatch(global, "__next") || keyPrefixMatch(global, "__NEXT"));
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/Nuxt.mjs
function nuxtWebDetect() {
  return windowExists() && (window.__NUXT__ !== void 0 || window.$nuxt !== void 0);
}
function nuxtSSRDetect() {
  return globalExists() && typeof global.__NUXT_PATHS__ !== "undefined";
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/Angular.mjs
function angularWebDetect() {
  const angularVersionSetInDocument = Boolean(documentExists() && document.querySelector("[ng-version]"));
  const angularContentSetInWindow = Boolean(windowExists() && typeof window.ng !== "undefined");
  return angularVersionSetInDocument || angularContentSetInWindow;
}
function angularSSRDetect() {
  return processExists() && typeof process.env === "object" && process.env.npm_lifecycle_script?.startsWith("ng ") || false;
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/ReactNative.mjs
function reactNativeDetect() {
  return typeof navigator !== "undefined" && typeof navigator.product !== "undefined" && navigator.product === "ReactNative";
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/Expo.mjs
function expoDetect() {
  return globalExists() && typeof global.expo !== "undefined";
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/Web.mjs
function webDetect() {
  return windowExists();
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detection/index.mjs
var detectionMap = [
  // First, detect mobile
  { platform: Framework.Expo, detectionMethod: expoDetect },
  { platform: Framework.ReactNative, detectionMethod: reactNativeDetect },
  // Next, detect web frameworks
  { platform: Framework.NextJs, detectionMethod: nextWebDetect },
  { platform: Framework.Nuxt, detectionMethod: nuxtWebDetect },
  { platform: Framework.Angular, detectionMethod: angularWebDetect },
  { platform: Framework.React, detectionMethod: reactWebDetect },
  { platform: Framework.VueJs, detectionMethod: vueWebDetect },
  { platform: Framework.Svelte, detectionMethod: svelteWebDetect },
  { platform: Framework.WebUnknown, detectionMethod: webDetect },
  // Last, detect ssr frameworks
  { platform: Framework.NextJsSSR, detectionMethod: nextSSRDetect },
  { platform: Framework.NuxtSSR, detectionMethod: nuxtSSRDetect },
  { platform: Framework.ReactSSR, detectionMethod: reactSSRDetect },
  { platform: Framework.VueJsSSR, detectionMethod: vueSSRDetect },
  { platform: Framework.AngularSSR, detectionMethod: angularSSRDetect },
  { platform: Framework.SvelteSSR, detectionMethod: svelteSSRDetect }
];
function detect() {
  return detectionMap.find((detectionEntry) => detectionEntry.detectionMethod())?.platform || Framework.ServerSideUnknown;
}

// node_modules/@aws-amplify/core/dist/esm/Platform/detectFramework.mjs
var frameworkCache;
var frameworkChangeObservers = [];
var resetTriggered = false;
var SSR_RESET_TIMEOUT = 10;
var WEB_RESET_TIMEOUT = 10;
var PRIME_FRAMEWORK_DELAY = 1e3;
var detectFramework = () => {
  if (!frameworkCache) {
    frameworkCache = detect();
    if (resetTriggered) {
      while (frameworkChangeObservers.length) {
        frameworkChangeObservers.pop()?.();
      }
    } else {
      frameworkChangeObservers.forEach((fcn) => {
        fcn();
      });
    }
    resetTimeout(Framework.ServerSideUnknown, SSR_RESET_TIMEOUT);
    resetTimeout(Framework.WebUnknown, WEB_RESET_TIMEOUT);
  }
  return frameworkCache;
};
var observeFrameworkChanges = (fcn) => {
  if (resetTriggered) {
    return;
  }
  frameworkChangeObservers.push(fcn);
};
function clearCache() {
  frameworkCache = void 0;
}
function resetTimeout(framework, delay) {
  if (frameworkCache === framework && !resetTriggered) {
    setTimeout(() => {
      clearCache();
      resetTriggered = true;
      setTimeout(detectFramework, PRIME_FRAMEWORK_DELAY);
    }, delay);
  }
}

// node_modules/@aws-amplify/core/dist/esm/Platform/customUserAgent.mjs
var customUserAgentState = {};
var getCustomUserAgent = (category, api2) => customUserAgentState[category]?.[api2]?.additionalDetails;

// node_modules/@aws-amplify/core/dist/esm/Platform/index.mjs
var BASE_USER_AGENT = `aws-amplify`;
var sanitizeAmplifyVersion = (amplifyVersion) => amplifyVersion.replace(/\+.*/, "");
var PlatformBuilder = class {
  constructor() {
    this.userAgent = `${BASE_USER_AGENT}/${sanitizeAmplifyVersion(version)}`;
  }
  get framework() {
    return detectFramework();
  }
  get isReactNative() {
    return this.framework === Framework.ReactNative || this.framework === Framework.Expo;
  }
  observeFrameworkChanges(fcn) {
    observeFrameworkChanges(fcn);
  }
};
var Platform = new PlatformBuilder();
var getAmplifyUserAgentObject = ({ category, action } = {}) => {
  const userAgent = [
    [BASE_USER_AGENT, sanitizeAmplifyVersion(version)]
  ];
  if (category) {
    userAgent.push([category, action]);
  }
  userAgent.push(["framework", detectFramework()]);
  if (category && action) {
    const customState = getCustomUserAgent(category, action);
    if (customState) {
      customState.forEach((state) => {
        userAgent.push(state);
      });
    }
  }
  return userAgent;
};
var getAmplifyUserAgent = (customUserAgentDetails) => {
  const userAgent = getAmplifyUserAgentObject(customUserAgentDetails);
  const userAgentString = userAgent.map(([agentKey, agentValue]) => agentKey && agentValue ? `${agentKey}/${agentValue}` : agentKey).join(" ");
  return userAgentString;
};

// node_modules/@aws-amplify/core/dist/esm/errors/PlatformNotSupportedError.mjs
var PlatformNotSupportedError = class extends AmplifyError {
  constructor() {
    super({
      name: AmplifyErrorCode.PlatformNotSupported,
      message: "Function not supported on current platform"
    });
  }
};

// node_modules/@aws-amplify/core/dist/esm/BackgroundProcessManager/types.mjs
var BackgroundProcessManagerState;
(function(BackgroundProcessManagerState2) {
  BackgroundProcessManagerState2["Open"] = "Open";
  BackgroundProcessManagerState2["Closing"] = "Closing";
  BackgroundProcessManagerState2["Closed"] = "Closed";
})(BackgroundProcessManagerState || (BackgroundProcessManagerState = {}));

// node_modules/@aws-amplify/core/dist/esm/Reachability/Reachability.mjs
var Reachability = class _Reachability {
  networkMonitor(_) {
    const globalObj = isWebWorker() ? self : typeof window !== "undefined" && window;
    if (!globalObj) {
      return from([{ online: true }]);
    }
    return new Observable((observer) => {
      observer.next({ online: globalObj.navigator.onLine });
      const notifyOnline = () => {
        observer.next({ online: true });
      };
      const notifyOffline = () => {
        observer.next({ online: false });
      };
      globalObj.addEventListener("online", notifyOnline);
      globalObj.addEventListener("offline", notifyOffline);
      _Reachability._observers.push(observer);
      return () => {
        globalObj.removeEventListener("online", notifyOnline);
        globalObj.removeEventListener("offline", notifyOffline);
        _Reachability._observers = _Reachability._observers.filter((_observer) => _observer !== observer);
      };
    });
  }
  // expose observers to simulate offline mode for integration testing
  static _observerOverride(status) {
    for (const observer of this._observers) {
      if (observer.closed) {
        this._observers = this._observers.filter((_observer) => _observer !== observer);
        continue;
      }
      observer?.next && observer.next(status);
    }
  }
};
Reachability._observers = [];

// node_modules/@aws-amplify/core/dist/esm/singleton/apis/internal/fetchAuthSession.mjs
var fetchAuthSession = (amplify, options) => {
  return amplify.Auth.fetchAuthSession(options);
};

// node_modules/@aws-amplify/core/dist/esm/Hub/index.mjs
var AMPLIFY_SYMBOL = typeof Symbol !== "undefined" ? Symbol("amplify_default") : "@@amplify_default";
var logger4 = new ConsoleLogger("Hub");
var HubClass = class {
  constructor(name) {
    this.listeners = /* @__PURE__ */ new Map();
    this.protectedChannels = [
      "core",
      "auth",
      "api",
      "analytics",
      "interactions",
      "pubsub",
      "storage",
      "ui",
      "xr"
    ];
    this.name = name;
  }
  /**
   * Used internally to remove a Hub listener.
   *
   * @remarks
   * This private method is for internal use only. Instead of calling Hub.remove, call the result of Hub.listen.
   */
  _remove(channel, listener) {
    const holder = this.listeners.get(channel);
    if (!holder) {
      logger4.warn(`No listeners for ${channel}`);
      return;
    }
    this.listeners.set(channel, [
      ...holder.filter(({ callback }) => callback !== listener)
    ]);
  }
  dispatch(channel, payload, source, ampSymbol) {
    if (typeof channel === "string" && this.protectedChannels.indexOf(channel) > -1) {
      const hasAccess = ampSymbol === AMPLIFY_SYMBOL;
      if (!hasAccess) {
        logger4.warn(`WARNING: ${channel} is protected and dispatching on it can have unintended consequences`);
      }
    }
    const capsule = {
      channel,
      payload: __spreadValues({}, payload),
      source,
      patternInfo: []
    };
    try {
      this._toListeners(capsule);
    } catch (e) {
      logger4.error(e);
    }
  }
  listen(channel, callback, listenerName = "noname") {
    let cb;
    if (typeof callback !== "function") {
      throw new AmplifyError({
        name: NO_HUBCALLBACK_PROVIDED_EXCEPTION,
        message: "No callback supplied to Hub"
      });
    } else {
      cb = callback;
    }
    let holder = this.listeners.get(channel);
    if (!holder) {
      holder = [];
      this.listeners.set(channel, holder);
    }
    holder.push({
      name: listenerName,
      callback: cb
    });
    return () => {
      this._remove(channel, cb);
    };
  }
  _toListeners(capsule) {
    const { channel, payload } = capsule;
    const holder = this.listeners.get(channel);
    if (holder) {
      holder.forEach((listener) => {
        logger4.debug(`Dispatching to ${channel} with `, payload);
        try {
          listener.callback(capsule);
        } catch (e) {
          logger4.error(e);
        }
      });
    }
  }
};
var Hub = new HubClass("__default__");
var HubInternal = new HubClass("internal-hub");

// node_modules/@aws-amplify/core/dist/esm/utils/convert/base64/bytesToString.mjs
function bytesToString(input) {
  return Array.from(input, (byte) => String.fromCodePoint(byte)).join("");
}

// node_modules/@aws-amplify/core/dist/esm/utils/convert/base64/base64Encoder.mjs
var base64Encoder = {
  /**
   * Convert input to base64-encoded string
   * @param input - string to convert to base64
   * @param options - encoding options that can optionally produce a base64url string
   * @returns base64-encoded string
   */
  convert(input, options = {
    urlSafe: false,
    skipPadding: false
  }) {
    const inputStr = typeof input === "string" ? input : bytesToString(input);
    let encodedStr = getBtoa()(inputStr);
    if (options.urlSafe) {
      encodedStr = encodedStr.replace(/\+/g, "-").replace(/\//g, "_");
    }
    if (options.skipPadding) {
      encodedStr = encodedStr.replace(/=/g, "");
    }
    return encodedStr;
  }
};

// node_modules/@aws-amplify/core/dist/esm/utils/cryptoSecureRandomInt.mjs
function cryptoSecureRandomInt() {
  const crypto2 = getCrypto();
  const randomResult = crypto2.getRandomValues(new Uint32Array(1))[0];
  return randomResult;
}

// node_modules/@aws-amplify/core/dist/esm/utils/WordArray.mjs
function hexStringify(wordArray) {
  const { words } = wordArray;
  const { sigBytes } = wordArray;
  const hexChars = [];
  for (let i = 0; i < sigBytes; i++) {
    const bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
    hexChars.push((bite >>> 4).toString(16));
    hexChars.push((bite & 15).toString(16));
  }
  return hexChars.join("");
}
var WordArray = class _WordArray {
  constructor(words, sigBytes) {
    this.words = [];
    let Words = words;
    Words = this.words = Words || [];
    if (sigBytes !== void 0) {
      this.sigBytes = sigBytes;
    } else {
      this.sigBytes = Words.length * 4;
    }
  }
  random(nBytes) {
    const words = [];
    for (let i = 0; i < nBytes; i += 4) {
      words.push(cryptoSecureRandomInt());
    }
    return new _WordArray(words, nBytes);
  }
  toString() {
    return hexStringify(this);
  }
};

// node_modules/@aws-amplify/core/dist/esm/utils/sessionListener/SessionListener.mjs
var stateChangeListeners = /* @__PURE__ */ new Set();
var SessionListener = class {
  constructor() {
    this.listenerActive = false;
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    if (isBrowser()) {
      document.addEventListener("visibilitychange", this.handleVisibilityChange, false);
      this.listenerActive = true;
    }
  }
  addStateChangeListener(listener, notifyOnAdd = false) {
    if (!this.listenerActive) {
      return;
    }
    stateChangeListeners.add(listener);
    if (notifyOnAdd) {
      listener(this.getSessionState());
    }
  }
  removeStateChangeListener(handler) {
    if (!this.listenerActive) {
      return;
    }
    stateChangeListeners.delete(handler);
  }
  handleVisibilityChange() {
    this.notifyHandlers();
  }
  notifyHandlers() {
    const sessionState = this.getSessionState();
    stateChangeListeners.forEach((listener) => {
      listener(sessionState);
    });
  }
  getSessionState() {
    if (isBrowser() && document.visibilityState !== "hidden") {
      return "started";
    }
    return "ended";
  }
};

// node_modules/@aws-amplify/core/dist/esm/utils/sessionListener/index.mjs
var sessionListener = new SessionListener();

// node_modules/@aws-amplify/core/dist/esm/utils/deepFreeze.mjs
var deepFreeze = (object) => {
  const propNames = Reflect.ownKeys(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object" || typeof value === "function") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
};

// node_modules/@aws-amplify/core/dist/esm/singleton/Auth/index.mjs
var logger5 = new ConsoleLogger("Auth");
var AuthClass = class {
  /**
   * Configure Auth category
   *
   * @internal
   *
   * @param authResourcesConfig - Resources configurations required by Auth providers.
   * @param authOptions - Client options used by library
   *
   * @returns void
   */
  configure(authResourcesConfig, authOptions) {
    this.authConfig = authResourcesConfig;
    this.authOptions = authOptions;
    if (authResourcesConfig && authResourcesConfig.Cognito?.userPoolEndpoint) {
      logger5.warn(getCustomEndpointWarningMessage("Amazon Cognito User Pool"));
    }
    if (authResourcesConfig && authResourcesConfig.Cognito?.identityPoolEndpoint) {
      logger5.warn(getCustomEndpointWarningMessage("Amazon Cognito Identity Pool"));
    }
  }
  /**
   * Fetch the auth tokens, and the temporary AWS credentials and identity if they are configured. By default it
   * will automatically refresh expired auth tokens if a valid refresh token is present. You can force a refresh
   * of non-expired tokens with `{ forceRefresh: true }` input.
   *
   * @param options - Options configuring the fetch behavior.
   *
   * @returns Promise of current auth session {@link AuthSession}.
   */
  fetchAuthSession() {
    return __async(this, arguments, function* (options = {}) {
      let credentialsAndIdentityId;
      let userSub;
      const tokens = yield this.getTokens(options);
      if (tokens) {
        userSub = tokens.accessToken?.payload?.sub;
        credentialsAndIdentityId = yield this.authOptions?.credentialsProvider?.getCredentialsAndIdentityId({
          authConfig: this.authConfig,
          tokens,
          authenticated: true,
          forceRefresh: options.forceRefresh
        });
      } else {
        credentialsAndIdentityId = yield this.authOptions?.credentialsProvider?.getCredentialsAndIdentityId({
          authConfig: this.authConfig,
          authenticated: false,
          forceRefresh: options.forceRefresh
        });
      }
      return {
        tokens,
        credentials: credentialsAndIdentityId?.credentials,
        identityId: credentialsAndIdentityId?.identityId,
        userSub
      };
    });
  }
  clearCredentials() {
    return __async(this, null, function* () {
      yield this.authOptions?.credentialsProvider?.clearCredentialsAndIdentityId();
    });
  }
  getTokens(options) {
    return __async(this, null, function* () {
      return (yield this.authOptions?.tokenProvider?.getTokens(options)) ?? void 0;
    });
  }
};
var getCustomEndpointWarningMessage = (target) => `You are using a custom Amazon ${target} endpoint, ensure the endpoint is correct.`;

// node_modules/@aws-amplify/core/dist/esm/singleton/Amplify.mjs
var AmplifyClass = class {
  constructor() {
    this.oAuthListener = void 0;
    this.isConfigured = false;
    this.resourcesConfig = {};
    this.libraryOptions = {};
    this.Auth = new AuthClass();
  }
  /**
   * Configures Amplify for use with your back-end resources.
   *
   * @remarks
   * This API does not perform any merging of either `resourcesConfig` or `libraryOptions`. The most recently
   * provided values will be used after configuration.
   *
   * @remarks
   * `configure` can be used to specify additional library options where available for supported categories.
   *
   * @param resourceConfig - Back-end resource configuration. Typically provided via the `aws-exports.js` file.
   * @param libraryOptions - Additional options for customizing the behavior of the library.
   */
  configure(resourcesConfig, libraryOptions) {
    const resolvedResourceConfig = parseAmplifyConfig(resourcesConfig);
    this.resourcesConfig = resolvedResourceConfig;
    if (libraryOptions) {
      this.libraryOptions = libraryOptions;
    }
    this.resourcesConfig = deepFreeze(this.resourcesConfig);
    this.Auth.configure(this.resourcesConfig.Auth, this.libraryOptions.Auth);
    if (this.resourcesConfig.Analytics?.Pinpoint || this.resourcesConfig.Notifications?.InAppMessaging?.Pinpoint || this.resourcesConfig.Notifications?.PushNotification?.Pinpoint) {
      console.warn("AWS will end support for Amazon Pinpoint on October 30, 2026. The guidance is to use AWS End User Messaging for push notifications and SMS, Amazon Simple Email Service for sending emails, Amazon Connect for campaigns, journeys, endpoints, and engagement analytics. Pinpoint recommends Amazon Kinesis for event collection and mobile analytics.");
    }
    Hub.dispatch("core", {
      event: "configure",
      data: this.resourcesConfig
    }, "Configure", AMPLIFY_SYMBOL);
    this.notifyOAuthListener();
    this.isConfigured = true;
  }
  /**
   * Provides access to the current back-end resource configuration for the Library.
   *
   * @returns Returns the immutable back-end resource configuration.
   */
  getConfig() {
    if (!this.isConfigured) {
      console.warn(`Amplify has not been configured. Please call Amplify.configure() before using this service.`);
    }
    return this.resourcesConfig;
  }
  /** @internal */
  [ADD_OAUTH_LISTENER](listener) {
    if (this.resourcesConfig.Auth?.Cognito.loginWith?.oauth) {
      listener(this.resourcesConfig.Auth?.Cognito);
    } else {
      this.oAuthListener = listener;
    }
  }
  notifyOAuthListener() {
    if (!this.resourcesConfig.Auth?.Cognito.loginWith?.oauth || !this.oAuthListener) {
      return;
    }
    this.oAuthListener(this.resourcesConfig.Auth?.Cognito);
    this.oAuthListener = void 0;
  }
};
var Amplify = new AmplifyClass();

// node_modules/js-cookie/dist/js.cookie.mjs
function assign(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      target[key] = source[key];
    }
  }
  return target;
}
var defaultConverter = {
  read: function(value) {
    if (value[0] === '"') {
      value = value.slice(1, -1);
    }
    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
  },
  write: function(value) {
    return encodeURIComponent(value).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent
    );
  }
};
function init(converter, defaultAttributes) {
  function set(name, value, attributes) {
    if (typeof document === "undefined") {
      return;
    }
    attributes = assign({}, defaultAttributes, attributes);
    if (typeof attributes.expires === "number") {
      attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
    }
    if (attributes.expires) {
      attributes.expires = attributes.expires.toUTCString();
    }
    name = encodeURIComponent(name).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
    var stringifiedAttributes = "";
    for (var attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue;
      }
      stringifiedAttributes += "; " + attributeName;
      if (attributes[attributeName] === true) {
        continue;
      }
      stringifiedAttributes += "=" + attributes[attributeName].split(";")[0];
    }
    return document.cookie = name + "=" + converter.write(value, name) + stringifiedAttributes;
  }
  function get(name) {
    if (typeof document === "undefined" || arguments.length && !name) {
      return;
    }
    var cookies = document.cookie ? document.cookie.split("; ") : [];
    var jar = {};
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split("=");
      var value = parts.slice(1).join("=");
      try {
        var found = decodeURIComponent(parts[0]);
        jar[found] = converter.read(value, found);
        if (name === found) {
          break;
        }
      } catch (e) {
      }
    }
    return name ? jar[name] : jar;
  }
  return Object.create(
    {
      set,
      get,
      remove: function(name, attributes) {
        set(
          name,
          "",
          assign({}, attributes, {
            expires: -1
          })
        );
      },
      withAttributes: function(attributes) {
        return init(this.converter, assign({}, this.attributes, attributes));
      },
      withConverter: function(converter2) {
        return init(assign({}, this.converter, converter2), this.attributes);
      }
    },
    {
      attributes: { value: Object.freeze(defaultAttributes) },
      converter: { value: Object.freeze(converter) }
    }
  );
}
var api = init(defaultConverter, { path: "/" });

// node_modules/@aws-amplify/core/dist/esm/storage/CookieStorage.mjs
var CookieStorage = class {
  constructor(data = {}) {
    const { path, domain, expires, sameSite, secure } = data;
    this.domain = domain;
    this.path = path || "/";
    this.expires = Object.prototype.hasOwnProperty.call(data, "expires") ? expires : 365;
    this.secure = Object.prototype.hasOwnProperty.call(data, "secure") ? secure : true;
    if (Object.prototype.hasOwnProperty.call(data, "sameSite")) {
      if (!sameSite || !["strict", "lax", "none"].includes(sameSite)) {
        throw new Error('The sameSite value of cookieStorage must be "lax", "strict" or "none".');
      }
      if (sameSite === "none" && !this.secure) {
        throw new Error("sameSite = None requires the Secure attribute in latest browser versions.");
      }
      this.sameSite = sameSite;
    }
  }
  setItem(key, value) {
    return __async(this, null, function* () {
      api.set(key, value, this.getData());
    });
  }
  getItem(key) {
    return __async(this, null, function* () {
      const item = api.get(key);
      return item ?? null;
    });
  }
  removeItem(key) {
    return __async(this, null, function* () {
      api.remove(key, this.getData());
    });
  }
  clear() {
    return __async(this, null, function* () {
      const cookie = api.get();
      const promises = Object.keys(cookie).map((key) => this.removeItem(key));
      yield Promise.all(promises);
    });
  }
  getData() {
    return __spreadValues({
      path: this.path,
      expires: this.expires,
      domain: this.domain,
      secure: this.secure
    }, this.sameSite && { sameSite: this.sameSite });
  }
};

// node_modules/@aws-amplify/core/dist/esm/storage/KeyValueStorage.mjs
var KeyValueStorage = class {
  constructor(storage) {
    this.storage = storage;
  }
  /**
   * This is used to set a specific item in storage
   * @param {string} key - the key for the item
   * @param {object} value - the value
   * @returns {string} value that was set
   */
  setItem(key, value) {
    return __async(this, null, function* () {
      if (!this.storage)
        throw new PlatformNotSupportedError();
      this.storage.setItem(key, value);
    });
  }
  /**
   * This is used to get a specific key from storage
   * @param {string} key - the key for the item
   * This is used to clear the storage
   * @returns {string} the data item
   */
  getItem(key) {
    return __async(this, null, function* () {
      if (!this.storage)
        throw new PlatformNotSupportedError();
      return this.storage.getItem(key);
    });
  }
  /**
   * This is used to remove an item from storage
   * @param {string} key - the key being set
   * @returns {string} value - value that was deleted
   */
  removeItem(key) {
    return __async(this, null, function* () {
      if (!this.storage)
        throw new PlatformNotSupportedError();
      this.storage.removeItem(key);
    });
  }
  /**
   * This is used to clear the storage
   * @returns {string} nothing
   */
  clear() {
    return __async(this, null, function* () {
      if (!this.storage)
        throw new PlatformNotSupportedError();
      this.storage.clear();
    });
  }
};

// node_modules/@aws-amplify/core/dist/esm/storage/InMemoryStorage.mjs
var InMemoryStorage = class {
  constructor() {
    this.storage = /* @__PURE__ */ new Map();
  }
  get length() {
    return this.storage.size;
  }
  key(index) {
    if (index > this.length - 1) {
      return null;
    }
    return Array.from(this.storage.keys())[index];
  }
  setItem(key, value) {
    this.storage.set(key, value);
  }
  getItem(key) {
    return this.storage.get(key) ?? null;
  }
  removeItem(key) {
    this.storage.delete(key);
  }
  clear() {
    this.storage.clear();
  }
};

// node_modules/@aws-amplify/core/dist/esm/storage/utils.mjs
var logger6 = new ConsoleLogger("CoreStorageUtils");
var getLocalStorageWithFallback = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {
    logger6.info("localStorage not found. InMemoryStorage is used as a fallback.");
  }
  return new InMemoryStorage();
};
var getSessionStorageWithFallback = () => {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.getItem("test");
      return window.sessionStorage;
    }
    throw new Error("sessionStorage is not defined");
  } catch (e) {
    logger6.info("sessionStorage not found. InMemoryStorage is used as a fallback.");
    return new InMemoryStorage();
  }
};

// node_modules/@aws-amplify/core/dist/esm/storage/DefaultStorage.mjs
var DefaultStorage = class extends KeyValueStorage {
  constructor() {
    super(getLocalStorageWithFallback());
  }
};

// node_modules/@aws-amplify/core/dist/esm/storage/SessionStorage.mjs
var SessionStorage = class extends KeyValueStorage {
  constructor() {
    super(getSessionStorageWithFallback());
  }
};

// node_modules/@aws-amplify/core/dist/esm/storage/SyncKeyValueStorage.mjs
var SyncKeyValueStorage = class {
  constructor(storage) {
    this._storage = storage;
  }
  get storage() {
    if (!this._storage)
      throw new PlatformNotSupportedError();
    return this._storage;
  }
  /**
   * This is used to set a specific item in storage
   * @param {string} key - the key for the item
   * @param {object} value - the value
   * @returns {string} value that was set
   */
  setItem(key, value) {
    this.storage.setItem(key, value);
  }
  /**
   * This is used to get a specific key from storage
   * @param {string} key - the key for the item
   * This is used to clear the storage
   * @returns {string} the data item
   */
  getItem(key) {
    return this.storage.getItem(key);
  }
  /**
   * This is used to remove an item from storage
   * @param {string} key - the key being set
   * @returns {string} value - value that was deleted
   */
  removeItem(key) {
    this.storage.removeItem(key);
  }
  /**
   * This is used to clear the storage
   * @returns {string} nothing
   */
  clear() {
    this.storage.clear();
  }
};

// node_modules/@aws-amplify/core/dist/esm/storage/SyncSessionStorage.mjs
var SyncSessionStorage = class extends SyncKeyValueStorage {
  constructor() {
    super(getSessionStorageWithFallback());
  }
};

// node_modules/@aws-amplify/core/dist/esm/storage/index.mjs
var defaultStorage = new DefaultStorage();
var sessionStorage = new SessionStorage();
var syncSessionStorage = new SyncSessionStorage();
var sharedInMemoryStorage = new KeyValueStorage(new InMemoryStorage());

// node_modules/@aws-amplify/core/dist/esm/singleton/apis/fetchAuthSession.mjs
var fetchAuthSession2 = (options) => {
  return fetchAuthSession(Amplify, options);
};

// node_modules/@aws-amplify/core/dist/esm/clients/serde/responseInfo.mjs
var parseMetadata = (response) => {
  const { headers, statusCode } = response;
  return __spreadProps(__spreadValues({}, isMetadataBearer(response) ? response.$metadata : {}), {
    httpStatusCode: statusCode,
    requestId: headers["x-amzn-requestid"] ?? headers["x-amzn-request-id"] ?? headers["x-amz-request-id"],
    extendedRequestId: headers["x-amz-id-2"],
    cfId: headers["x-amz-cf-id"]
  });
};
var isMetadataBearer = (response) => typeof response?.$metadata === "object";

// node_modules/@aws-amplify/core/dist/esm/clients/serde/json.mjs
var parseJsonError = (response) => __async(void 0, null, function* () {
  if (!response || response.statusCode < 300) {
    return;
  }
  const body = yield parseJsonBody(response);
  const sanitizeErrorCode = (rawValue) => {
    const [cleanValue] = rawValue.toString().split(/[,:]+/);
    if (cleanValue.includes("#")) {
      return cleanValue.split("#")[1];
    }
    return cleanValue;
  };
  const code = sanitizeErrorCode(response.headers["x-amzn-errortype"] ?? body.code ?? body.__type ?? "UnknownError");
  const message = body.message ?? body.Message ?? "Unknown error";
  const error = new Error(message);
  return Object.assign(error, {
    name: code,
    $metadata: parseMetadata(response)
  });
});
var parseJsonBody = (response) => __async(void 0, null, function* () {
  if (!response.body) {
    throw new Error("Missing response payload");
  }
  const output = yield response.body.json();
  return Object.assign(output, {
    $metadata: parseMetadata(response)
  });
});

// node_modules/@aws-amplify/core/dist/esm/clients/internal/composeServiceApi.mjs
var composeServiceApi = (transferHandler, serializer, deserializer, defaultConfig3) => {
  return (config, input) => __async(void 0, null, function* () {
    const resolvedConfig = __spreadValues(__spreadValues({}, defaultConfig3), config);
    const endpoint = yield resolvedConfig.endpointResolver(resolvedConfig, input);
    const request = yield serializer(input, endpoint);
    const response = yield transferHandler(request, __spreadValues({}, resolvedConfig));
    return deserializer(response);
  });
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/constants.mjs
var DEFAULT_RETRY_ATTEMPTS = 3;
var AMZ_SDK_INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
var AMZ_SDK_REQUEST_HEADER = "amz-sdk-request";
var DEFAULT_MAX_DELAY_MS = 5 * 60 * 1e3;

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/jitteredBackoff.mjs
var jitteredBackoff2 = (attempt) => {
  const delayFunction = jitteredBackoff(DEFAULT_MAX_DELAY_MS);
  const delay = delayFunction(attempt);
  return delay === false ? DEFAULT_MAX_DELAY_MS : delay;
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/isClockSkewError.mjs
var CLOCK_SKEW_ERROR_CODES = [
  "AuthFailure",
  "InvalidSignatureException",
  "RequestExpired",
  "RequestInTheFuture",
  "RequestTimeTooSkewed",
  "SignatureDoesNotMatch",
  "BadRequestException"
  // API Gateway
];
var isClockSkewError = (errorCode) => !!errorCode && CLOCK_SKEW_ERROR_CODES.includes(errorCode);

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/defaultRetryDecider.mjs
var getRetryDecider = (errorParser) => (response, error) => __async(void 0, null, function* () {
  const parsedError = error ?? (yield errorParser(response)) ?? void 0;
  const errorCode = parsedError?.code || parsedError?.name;
  const statusCode = response?.statusCode;
  const isRetryable = isConnectionError(error) || isThrottlingError(statusCode, errorCode) || isClockSkewError(errorCode) || isServerSideError(statusCode, errorCode);
  return {
    retryable: isRetryable
  };
});
var THROTTLING_ERROR_CODES = [
  "BandwidthLimitExceeded",
  "EC2ThrottledException",
  "LimitExceededException",
  "PriorRequestNotComplete",
  "ProvisionedThroughputExceededException",
  "RequestLimitExceeded",
  "RequestThrottled",
  "RequestThrottledException",
  "SlowDown",
  "ThrottledException",
  "Throttling",
  "ThrottlingException",
  "TooManyRequestsException"
];
var TIMEOUT_ERROR_CODES = [
  "TimeoutError",
  "RequestTimeout",
  "RequestTimeoutException"
];
var isThrottlingError = (statusCode, errorCode) => statusCode === 429 || !!errorCode && THROTTLING_ERROR_CODES.includes(errorCode);
var isConnectionError = (error) => [
  AmplifyErrorCode.NetworkError,
  // TODO(vNext): unify the error code `ERR_NETWORK` used by the Storage XHR handler
  "ERR_NETWORK"
].includes(error?.name);
var isServerSideError = (statusCode, errorCode) => !!statusCode && [500, 502, 503, 504].includes(statusCode) || !!errorCode && TIMEOUT_ERROR_CODES.includes(errorCode);

// node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/constants.mjs
var COGNITO_IDENTITY_SERVICE_NAME = "cognito-identity";
var DEFAULT_SERVICE_CLIENT_API_CONFIG = {
  service: COGNITO_IDENTITY_SERVICE_NAME,
  retryDecider: getRetryDecider(parseJsonError),
  computeDelay: jitteredBackoff2,
  cache: "no-store"
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/retryMiddleware.mjs
var retryMiddlewareFactory = ({ maxAttempts = DEFAULT_RETRY_ATTEMPTS, retryDecider, computeDelay, abortSignal }) => {
  if (maxAttempts < 1) {
    throw new Error("maxAttempts must be greater than 0");
  }
  return (next, context) => function retryMiddleware(request) {
    return __async(this, null, function* () {
      let error;
      let attemptsCount = context.attemptsCount ?? 0;
      let response;
      const handleTerminalErrorOrResponse = () => {
        if (response) {
          addOrIncrementMetadataAttempts(response, attemptsCount);
          return response;
        } else {
          addOrIncrementMetadataAttempts(error, attemptsCount);
          throw error;
        }
      };
      while (!abortSignal?.aborted && attemptsCount < maxAttempts) {
        try {
          response = yield next(request);
          error = void 0;
        } catch (e) {
          error = e;
          response = void 0;
        }
        attemptsCount = (context.attemptsCount ?? 0) > attemptsCount ? context.attemptsCount ?? 0 : attemptsCount + 1;
        context.attemptsCount = attemptsCount;
        const { isCredentialsExpiredError, retryable } = yield retryDecider(response, error, context);
        if (retryable) {
          context.isCredentialsExpired = !!isCredentialsExpiredError;
          if (!abortSignal?.aborted && attemptsCount < maxAttempts) {
            const delay = computeDelay(attemptsCount);
            yield cancellableSleep(delay, abortSignal);
          }
          continue;
        } else {
          return handleTerminalErrorOrResponse();
        }
      }
      if (abortSignal?.aborted) {
        throw new Error("Request aborted.");
      } else {
        return handleTerminalErrorOrResponse();
      }
    });
  };
};
var cancellableSleep = (timeoutMs, abortSignal) => {
  if (abortSignal?.aborted) {
    return Promise.resolve();
  }
  let timeoutId;
  let sleepPromiseResolveFn;
  const sleepPromise = new Promise((resolve) => {
    sleepPromiseResolveFn = resolve;
    timeoutId = setTimeout(resolve, timeoutMs);
  });
  abortSignal?.addEventListener("abort", function cancelSleep(_) {
    clearTimeout(timeoutId);
    abortSignal?.removeEventListener("abort", cancelSleep);
    sleepPromiseResolveFn();
  });
  return sleepPromise;
};
var addOrIncrementMetadataAttempts = (nextHandlerOutput, attempts) => {
  if (Object.prototype.toString.call(nextHandlerOutput) !== "[object Object]") {
    return;
  }
  nextHandlerOutput.$metadata = __spreadProps(__spreadValues({}, nextHandlerOutput.$metadata ?? {}), {
    attempts
  });
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/amzSdkInvocationIdHeaderMiddleware.mjs
var amzSdkInvocationIdHeaderMiddlewareFactory = () => (next) => {
  return function amzSdkInvocationIdHeaderMiddleware(request) {
    return __async(this, null, function* () {
      if (!request.headers[AMZ_SDK_INVOCATION_ID_HEADER]) {
        request.headers[AMZ_SDK_INVOCATION_ID_HEADER] = amplifyUuid();
      }
      return next(request);
    });
  };
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/amzSdkRequestHeaderMiddleware.mjs
var amzSdkRequestHeaderMiddlewareFactory = ({ maxAttempts = DEFAULT_RETRY_ATTEMPTS }) => (next, context) => {
  return function amzSdkRequestHeaderMiddleware(request) {
    return __async(this, null, function* () {
      const attemptsCount = context.attemptsCount ?? 0;
      request.headers[AMZ_SDK_REQUEST_HEADER] = `attempt=${attemptsCount + 1}; max=${maxAttempts}`;
      return next(request);
    });
  };
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/userAgent/middleware.mjs
var userAgentMiddlewareFactory = ({ userAgentHeader = "x-amz-user-agent", userAgentValue = "" }) => (next) => {
  return function userAgentMiddleware(request) {
    return __async(this, null, function* () {
      if (userAgentValue.trim().length === 0) {
        const result = yield next(request);
        return result;
      } else {
        const headerName = userAgentHeader.toLowerCase();
        request.headers[headerName] = request.headers[headerName] ? `${request.headers[headerName]} ${userAgentValue}` : userAgentValue;
        const response = yield next(request);
        return response;
      }
    });
  };
};

// node_modules/@aws-amplify/core/dist/esm/clients/internal/composeTransferHandler.mjs
var composeTransferHandler = (coreHandler, middleware) => (request, options) => {
  const context = {};
  let composedHandler = (composeHandlerRequest) => coreHandler(composeHandlerRequest, options);
  for (let i = middleware.length - 1; i >= 0; i--) {
    const m = middleware[i];
    const resolvedMiddleware = m(options);
    composedHandler = resolvedMiddleware(composedHandler, context);
  }
  return composedHandler(request);
};

// node_modules/@aws-amplify/core/dist/esm/clients/utils/memoization.mjs
var withMemoization = (payloadAccessor) => {
  let cached;
  return () => {
    if (!cached) {
      cached = payloadAccessor();
    }
    return cached;
  };
};

// node_modules/@aws-amplify/core/dist/esm/clients/handlers/fetch.mjs
var shouldSendBody = (method) => !["HEAD", "GET"].includes(method.toUpperCase());
var fetchTransferHandler = (_0, _1) => __async(void 0, [_0, _1], function* ({ url, method, headers, body }, { abortSignal, cache, withCrossDomainCredentials }) {
  let resp;
  try {
    resp = yield fetch(url, {
      method,
      headers,
      body: shouldSendBody(method) ? body : void 0,
      signal: abortSignal,
      cache,
      credentials: withCrossDomainCredentials ? "include" : "same-origin"
    });
  } catch (e) {
    if (e instanceof TypeError) {
      throw new AmplifyError({
        name: AmplifyErrorCode.NetworkError,
        message: "A network error has occurred.",
        underlyingError: e
      });
    }
    throw e;
  }
  const responseHeaders = {};
  resp.headers?.forEach((value, key) => {
    responseHeaders[key.toLowerCase()] = value;
  });
  const httpResponse = {
    statusCode: resp.status,
    headers: responseHeaders,
    body: null
  };
  const bodyWithMixin = Object.assign(resp.body ?? {}, {
    text: withMemoization(() => resp.text()),
    blob: withMemoization(() => resp.blob()),
    json: withMemoization(() => resp.json())
  });
  return __spreadProps(__spreadValues({}, httpResponse), {
    body: bodyWithMixin
  });
});

// node_modules/@aws-amplify/core/dist/esm/clients/handlers/aws/unauthenticated.mjs
var unauthenticatedHandler = composeTransferHandler(fetchTransferHandler, [
  userAgentMiddlewareFactory,
  amzSdkInvocationIdHeaderMiddlewareFactory,
  retryMiddlewareFactory,
  amzSdkRequestHeaderMiddlewareFactory
]);

// node_modules/@aws-amplify/core/dist/esm/foundation/factories/middleware/createDisableCacheMiddleware.mjs
var createDisableCacheMiddleware = () => (next) => function disableCacheMiddleware(request) {
  return __async(this, null, function* () {
    request.headers["cache-control"] = "no-store";
    return next(request);
  });
};

// node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/handler/cognitoIdentityTransferHandler.mjs
var cognitoIdentityTransferHandler = composeTransferHandler(unauthenticatedHandler, [createDisableCacheMiddleware]);

// node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/serde/createClientSerializer.mjs
var createClientSerializer = (operation) => (input, endpoint) => {
  const headers = getSharedHeaders(operation);
  const body = JSON.stringify(input);
  return buildHttpRpcRequest(endpoint, headers, body);
};
var getSharedHeaders = (operation) => ({
  "content-type": "application/x-amz-json-1.1",
  "x-amz-target": `AWSCognitoIdentityService.${operation}`
});
var buildHttpRpcRequest = ({ url }, headers, body) => ({
  headers,
  url,
  body,
  method: "POST"
});

// node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/createGetCredentialsForIdentityClient.mjs
var createGetCredentialsForIdentityClient = (config) => composeServiceApi(cognitoIdentityTransferHandler, createClientSerializer("GetCredentialsForIdentity"), getCredentialsForIdentityDeserializer, __spreadProps(__spreadValues(__spreadValues({}, DEFAULT_SERVICE_CLIENT_API_CONFIG), config), {
  userAgentValue: getAmplifyUserAgent()
}));
var getCredentialsForIdentityDeserializer = (response) => __async(void 0, null, function* () {
  if (response.statusCode >= 300) {
    const error = yield parseJsonError(response);
    throw error;
  }
  const body = yield parseJsonBody(response);
  return {
    IdentityId: body.IdentityId,
    Credentials: deserializeCredentials(body.Credentials),
    $metadata: parseMetadata(response)
  };
});
var deserializeCredentials = (_a = {}) => {
  var _b = _a, { Expiration } = _b, rest = __objRest(_b, ["Expiration"]);
  return __spreadProps(__spreadValues({}, rest), {
    Expiration: Expiration && new Date(Expiration * 1e3)
  });
};

// node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/createGetIdClient.mjs
var createGetIdClient = (config) => composeServiceApi(cognitoIdentityTransferHandler, createClientSerializer("GetId"), getIdDeserializer, __spreadProps(__spreadValues(__spreadValues({}, DEFAULT_SERVICE_CLIENT_API_CONFIG), config), {
  userAgentValue: getAmplifyUserAgent()
}));
var getIdDeserializer = (response) => __async(void 0, null, function* () {
  if (response.statusCode >= 300) {
    const error = yield parseJsonError(response);
    throw error;
  }
  const body = yield parseJsonBody(response);
  return {
    IdentityId: body.IdentityId,
    $metadata: parseMetadata(response)
  };
});

// node_modules/@aws-amplify/core/dist/esm/clients/endpoints/partitions.mjs
var defaultPartition = {
  id: "aws",
  outputs: {
    dnsSuffix: "amazonaws.com"
  },
  regionRegex: "^(us|eu|ap|sa|ca|me|af)\\-\\w+\\-\\d+$",
  regions: ["aws-global"]
};
var partitionsInfo = {
  partitions: [
    defaultPartition,
    {
      id: "aws-cn",
      outputs: {
        dnsSuffix: "amazonaws.com.cn"
      },
      regionRegex: "^cn\\-\\w+\\-\\d+$",
      regions: ["aws-cn-global"]
    }
  ]
};

// node_modules/@aws-amplify/core/dist/esm/clients/endpoints/getDnsSuffix.mjs
var getDnsSuffix = (region) => {
  const { partitions } = partitionsInfo;
  for (const { regions, outputs, regionRegex } of partitions) {
    const regex = new RegExp(regionRegex);
    if (regions.includes(region) || regex.test(region)) {
      return outputs.dnsSuffix;
    }
  }
  return defaultPartition.outputs.dnsSuffix;
};

// node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/cognitoIdentityPoolEndpointResolver.mjs
var cognitoIdentityPoolEndpointResolver = ({ region }) => ({
  url: new AmplifyUrl(`https://${COGNITO_IDENTITY_SERVICE_NAME}.${region}.${getDnsSuffix(region)}`)
});

// node_modules/@aws-amplify/core/dist/esm/Cache/constants.mjs
var defaultConfig = {
  keyPrefix: "aws-amplify-cache",
  capacityInBytes: 1048576,
  // 1MB
  itemMaxSize: 21e4,
  // about 200kb
  defaultTTL: 2592e5,
  // about 3 days
  defaultPriority: 5,
  warningThreshold: 0.8
};
var currentSizeKey = "CurSize";

// node_modules/@aws-amplify/core/dist/esm/Cache/utils/cacheHelpers.mjs
function getByteLength(str) {
  let ret = 0;
  ret = str.length;
  for (let i = str.length; i >= 0; i -= 1) {
    const charCode = str.charCodeAt(i);
    if (charCode > 127 && charCode <= 2047) {
      ret += 1;
    } else if (charCode > 2047 && charCode <= 65535) {
      ret += 2;
    }
    if (charCode >= 56320 && charCode <= 57343) {
      i -= 1;
    }
  }
  return ret;
}
function getCurrentTime() {
  const currentTime = /* @__PURE__ */ new Date();
  return currentTime.getTime();
}
var getCurrentSizeKey = (keyPrefix) => `${keyPrefix}${currentSizeKey}`;

// node_modules/@aws-amplify/core/dist/esm/Cache/utils/errorHelpers.mjs
var CacheErrorCode;
(function(CacheErrorCode2) {
  CacheErrorCode2["NoCacheItem"] = "NoCacheItem";
  CacheErrorCode2["NullNextNode"] = "NullNextNode";
  CacheErrorCode2["NullPreviousNode"] = "NullPreviousNode";
})(CacheErrorCode || (CacheErrorCode = {}));
var cacheErrorMap = {
  [CacheErrorCode.NoCacheItem]: {
    message: "Item not found in the cache storage."
  },
  [CacheErrorCode.NullNextNode]: {
    message: "Next node is null."
  },
  [CacheErrorCode.NullPreviousNode]: {
    message: "Previous node is null."
  }
};
var assert3 = createAssertionFunction(cacheErrorMap);

// node_modules/@aws-amplify/core/dist/esm/Cache/StorageCacheCommon.mjs
var logger7 = new ConsoleLogger("StorageCache");
var StorageCacheCommon = class {
  /**
   * Initialize the cache
   *
   * @param config - Custom configuration for this instance.
   */
  constructor({ config, keyValueStorage }) {
    this.config = __spreadValues(__spreadValues({}, defaultConfig), config);
    this.keyValueStorage = keyValueStorage;
    this.sanitizeConfig();
  }
  getModuleName() {
    return "Cache";
  }
  /**
   * Set custom configuration for the cache instance.
   *
   * @param config - customized configuration (without keyPrefix, which can't be changed)
   *
   * @return - the current configuration
   */
  configure(config) {
    if (config) {
      if (config.keyPrefix) {
        logger7.warn("keyPrefix can not be re-configured on an existing Cache instance.");
      }
      this.config = __spreadValues(__spreadValues({}, this.config), config);
    }
    this.sanitizeConfig();
    return this.config;
  }
  /**
   * return the current size of the cache
   * @return {Promise}
   */
  getCurrentCacheSize() {
    return __async(this, null, function* () {
      let size = yield this.getStorage().getItem(getCurrentSizeKey(this.config.keyPrefix));
      if (!size) {
        yield this.getStorage().setItem(getCurrentSizeKey(this.config.keyPrefix), "0");
        size = "0";
      }
      return Number(size);
    });
  }
  /**
   * Set item into cache. You can put number, string, boolean or object.
   * The cache will first check whether has the same key.
   * If it has, it will delete the old item and then put the new item in
   * The cache will pop out items if it is full
   * You can specify the cache item options. The cache will abort and output a warning:
   * If the key is invalid
   * If the size of the item exceeds itemMaxSize.
   * If the value is undefined
   * If incorrect cache item configuration
   * If error happened with browser storage
   *
   * @param {String} key - the key of the item
   * @param {Object} value - the value of the item
   * @param {Object} [options] - optional, the specified meta-data
   *
   * @return {Promise}
   */
  setItem(key, value, options) {
    return __async(this, null, function* () {
      logger7.debug(`Set item: key is ${key}, value is ${value} with options: ${options}`);
      if (!key || key === currentSizeKey) {
        logger7.warn(`Invalid key: should not be empty or reserved key: '${currentSizeKey}'`);
        return;
      }
      if (typeof value === "undefined") {
        logger7.warn(`The value of item should not be undefined!`);
        return;
      }
      const cacheItemOptions = {
        priority: options?.priority !== void 0 ? options.priority : this.config.defaultPriority,
        expires: options?.expires !== void 0 ? options.expires : this.config.defaultTTL + getCurrentTime()
      };
      if (cacheItemOptions.priority < 1 || cacheItemOptions.priority > 5) {
        logger7.warn(`Invalid parameter: priority due to out or range. It should be within 1 and 5.`);
        return;
      }
      const prefixedKey = `${this.config.keyPrefix}${key}`;
      const item = this.fillCacheItem(prefixedKey, value, cacheItemOptions);
      if (item.byteSize > this.config.itemMaxSize) {
        logger7.warn(`Item with key: ${key} you are trying to put into is too big!`);
        return;
      }
      try {
        const val = yield this.getStorage().getItem(prefixedKey);
        if (val) {
          yield this.removeCacheItem(prefixedKey, JSON.parse(val).byteSize);
        }
        if (yield this.isCacheFull(item.byteSize)) {
          const validKeys = yield this.clearInvalidAndGetRemainingKeys();
          if (yield this.isCacheFull(item.byteSize)) {
            const sizeToPop = yield this.sizeToPop(item.byteSize);
            yield this.popOutItems(validKeys, sizeToPop);
          }
        }
        return this.setCacheItem(prefixedKey, item);
      } catch (e) {
        logger7.warn(`setItem failed! ${e}`);
      }
    });
  }
  /**
   * Get item from cache. It will return null if item doesn’t exist or it has been expired.
   * If you specified callback function in the options,
   * then the function will be executed if no such item in the cache
   * and finally put the return value into cache.
   * Please make sure the callback function will return the value you want to put into the cache.
   * The cache will abort output a warning:
   * If the key is invalid
   * If error happened with AsyncStorage
   *
   * @param {String} key - the key of the item
   * @param {Object} [options] - the options of callback function
   *
   * @return {Promise} - return a promise resolves to be the value of the item
   */
  getItem(key, options) {
    return __async(this, null, function* () {
      logger7.debug(`Get item: key is ${key} with options ${options}`);
      let cached;
      if (!key || key === currentSizeKey) {
        logger7.warn(`Invalid key: should not be empty or reserved key: '${currentSizeKey}'`);
        return null;
      }
      const prefixedKey = `${this.config.keyPrefix}${key}`;
      try {
        cached = yield this.getStorage().getItem(prefixedKey);
        if (cached != null) {
          if (yield this.isExpired(prefixedKey)) {
            yield this.removeCacheItem(prefixedKey, JSON.parse(cached).byteSize);
          } else {
            const item = yield this.updateVisitedTime(JSON.parse(cached), prefixedKey);
            return item.data;
          }
        }
        if (options?.callback) {
          const val = options.callback();
          if (val !== null) {
            yield this.setItem(key, val, options);
          }
          return val;
        }
        return null;
      } catch (e) {
        logger7.warn(`getItem failed! ${e}`);
        return null;
      }
    });
  }
  /**
   * remove item from the cache
   * The cache will abort output a warning:
   * If error happened with AsyncStorage
   * @param {String} key - the key of the item
   * @return {Promise}
   */
  removeItem(key) {
    return __async(this, null, function* () {
      logger7.debug(`Remove item: key is ${key}`);
      if (!key || key === currentSizeKey) {
        logger7.warn(`Invalid key: should not be empty or reserved key: '${currentSizeKey}'`);
        return;
      }
      const prefixedKey = `${this.config.keyPrefix}${key}`;
      try {
        const val = yield this.getStorage().getItem(prefixedKey);
        if (val) {
          yield this.removeCacheItem(prefixedKey, JSON.parse(val).byteSize);
        }
      } catch (e) {
        logger7.warn(`removeItem failed! ${e}`);
      }
    });
  }
  /**
   * Return all the keys owned by this cache.
   * Will return an empty array if error occurred.
   *
   * @return {Promise}
   */
  getAllKeys() {
    return __async(this, null, function* () {
      try {
        return yield this.getAllCacheKeys();
      } catch (e) {
        logger7.warn(`getAllkeys failed! ${e}`);
        return [];
      }
    });
  }
  getStorage() {
    return this.keyValueStorage;
  }
  /**
   * check whether item is expired
   *
   * @param key - the key of the item
   *
   * @return true if the item is expired.
   */
  isExpired(key) {
    return __async(this, null, function* () {
      const text = yield this.getStorage().getItem(key);
      assert3(text !== null, CacheErrorCode.NoCacheItem, `Key: ${key}`);
      const item = JSON.parse(text);
      if (getCurrentTime() >= item.expires) {
        return true;
      }
      return false;
    });
  }
  /**
   * delete item from cache
   *
   * @param prefixedKey - the key of the item
   * @param size - optional, the byte size of the item
   */
  removeCacheItem(prefixedKey, size) {
    return __async(this, null, function* () {
      const item = yield this.getStorage().getItem(prefixedKey);
      assert3(item !== null, CacheErrorCode.NoCacheItem, `Key: ${prefixedKey}`);
      const itemSize = size ?? JSON.parse(item).byteSize;
      yield this.decreaseCurrentSizeInBytes(itemSize);
      try {
        yield this.getStorage().removeItem(prefixedKey);
      } catch (removeItemError) {
        yield this.increaseCurrentSizeInBytes(itemSize);
        logger7.error(`Failed to remove item: ${removeItemError}`);
      }
    });
  }
  /**
   * produce a JSON object with meta-data and data value
   * @param value - the value of the item
   * @param options - optional, the specified meta-data
   *
   * @return - the item which has the meta-data and the value
   */
  fillCacheItem(key, value, options) {
    const item = {
      key,
      data: value,
      timestamp: getCurrentTime(),
      visitedTime: getCurrentTime(),
      priority: options.priority ?? 0,
      expires: options.expires ?? 0,
      type: typeof value,
      byteSize: 0
    };
    item.byteSize = getByteLength(JSON.stringify(item));
    item.byteSize = getByteLength(JSON.stringify(item));
    return item;
  }
  sanitizeConfig() {
    if (this.config.itemMaxSize > this.config.capacityInBytes) {
      logger7.error("Invalid parameter: itemMaxSize. It should be smaller than capacityInBytes. Setting back to default.");
      this.config.itemMaxSize = defaultConfig.itemMaxSize;
    }
    if (this.config.defaultPriority > 5 || this.config.defaultPriority < 1) {
      logger7.error("Invalid parameter: defaultPriority. It should be between 1 and 5. Setting back to default.");
      this.config.defaultPriority = defaultConfig.defaultPriority;
    }
    if (Number(this.config.warningThreshold) > 1 || Number(this.config.warningThreshold) < 0) {
      logger7.error("Invalid parameter: warningThreshold. It should be between 0 and 1. Setting back to default.");
      this.config.warningThreshold = defaultConfig.warningThreshold;
    }
    const cacheLimit = 5 * 1024 * 1024;
    if (this.config.capacityInBytes > cacheLimit) {
      logger7.error("Cache Capacity should be less than 5MB. Setting back to default. Setting back to default.");
      this.config.capacityInBytes = defaultConfig.capacityInBytes;
    }
  }
  /**
   * increase current size of the cache
   *
   * @param amount - the amount of the cache szie which need to be increased
   */
  increaseCurrentSizeInBytes(amount) {
    return __async(this, null, function* () {
      const size = yield this.getCurrentCacheSize();
      yield this.getStorage().setItem(getCurrentSizeKey(this.config.keyPrefix), (size + amount).toString());
    });
  }
  /**
   * decrease current size of the cache
   *
   * @param amount - the amount of the cache size which needs to be decreased
   */
  decreaseCurrentSizeInBytes(amount) {
    return __async(this, null, function* () {
      const size = yield this.getCurrentCacheSize();
      yield this.getStorage().setItem(getCurrentSizeKey(this.config.keyPrefix), (size - amount).toString());
    });
  }
  /**
   * update the visited time if item has been visited
   *
   * @param item - the item which need to be updated
   * @param prefixedKey - the key of the item
   *
   * @return the updated item
   */
  updateVisitedTime(item, prefixedKey) {
    return __async(this, null, function* () {
      item.visitedTime = getCurrentTime();
      yield this.getStorage().setItem(prefixedKey, JSON.stringify(item));
      return item;
    });
  }
  /**
   * put item into cache
   *
   * @param prefixedKey - the key of the item
   * @param itemData - the value of the item
   * @param itemSizeInBytes - the byte size of the item
   */
  setCacheItem(prefixedKey, item) {
    return __async(this, null, function* () {
      yield this.increaseCurrentSizeInBytes(item.byteSize);
      try {
        yield this.getStorage().setItem(prefixedKey, JSON.stringify(item));
      } catch (setItemErr) {
        yield this.decreaseCurrentSizeInBytes(item.byteSize);
        logger7.error(`Failed to set item ${setItemErr}`);
      }
    });
  }
  /**
   * total space needed when poping out items
   *
   * @param itemSize
   *
   * @return total space needed
   */
  sizeToPop(itemSize) {
    return __async(this, null, function* () {
      const cur = yield this.getCurrentCacheSize();
      const spaceItemNeed = cur + itemSize - this.config.capacityInBytes;
      const cacheThresholdSpace = (1 - this.config.warningThreshold) * this.config.capacityInBytes;
      return spaceItemNeed > cacheThresholdSpace ? spaceItemNeed : cacheThresholdSpace;
    });
  }
  /**
   * see whether cache is full
   *
   * @param itemSize
   *
   * @return true if cache is full
   */
  isCacheFull(itemSize) {
    return __async(this, null, function* () {
      const cur = yield this.getCurrentCacheSize();
      return itemSize + cur > this.config.capacityInBytes;
    });
  }
  /**
   * get all the items we have, sort them by their priority,
   * if priority is same, sort them by their last visited time
   * pop out items from the low priority (5 is the lowest)
   * @private
   * @param keys - all the keys in this cache
   * @param sizeToPop - the total size of the items which needed to be poped out
   */
  popOutItems(keys, sizeToPop) {
    return __async(this, null, function* () {
      const items = [];
      let remainedSize = sizeToPop;
      for (const key of keys) {
        const val = yield this.getStorage().getItem(key);
        if (val != null) {
          const item = JSON.parse(val);
          items.push(item);
        }
      }
      items.sort((a, b) => {
        if (a.priority > b.priority) {
          return -1;
        } else if (a.priority < b.priority) {
          return 1;
        } else {
          if (a.visitedTime < b.visitedTime) {
            return -1;
          } else
            return 1;
        }
      });
      for (const item of items) {
        yield this.removeCacheItem(item.key, item.byteSize);
        remainedSize -= item.byteSize;
        if (remainedSize <= 0) {
          return;
        }
      }
    });
  }
  /**
   * Scan the storage and combine the following operations for efficiency
   *   1. Clear out all expired keys owned by this cache, not including the size key.
   *   2. Return the remaining keys.
   *
   * @return The remaining valid keys
   */
  clearInvalidAndGetRemainingKeys() {
    return __async(this, null, function* () {
      const remainingKeys = [];
      const keys = yield this.getAllCacheKeys({
        omitSizeKey: true
      });
      for (const key of keys) {
        if (yield this.isExpired(key)) {
          yield this.removeCacheItem(key);
        } else {
          remainingKeys.push(key);
        }
      }
      return remainingKeys;
    });
  }
  /**
   * clear the entire cache
   * The cache will abort and output a warning if error occurs
   * @return {Promise}
   */
  clear() {
    return __async(this, null, function* () {
      logger7.debug(`Clear Cache`);
      try {
        const keys = yield this.getAllKeys();
        for (const key of keys) {
          const prefixedKey = `${this.config.keyPrefix}${key}`;
          yield this.getStorage().removeItem(prefixedKey);
        }
      } catch (e) {
        logger7.warn(`clear failed! ${e}`);
      }
    });
  }
};

// node_modules/@aws-amplify/core/dist/esm/Cache/StorageCache.mjs
var logger8 = new ConsoleLogger("StorageCache");
var StorageCache = class _StorageCache extends StorageCacheCommon {
  /**
   * initialize the cache
   * @param config - the configuration of the cache
   */
  constructor(config) {
    const storage = getLocalStorageWithFallback();
    super({ config, keyValueStorage: new KeyValueStorage(storage) });
    this.storage = storage;
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }
  getAllCacheKeys(options) {
    return __async(this, null, function* () {
      const { omitSizeKey } = options ?? {};
      const keys = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (omitSizeKey && key === getCurrentSizeKey(this.config.keyPrefix)) {
          continue;
        }
        if (key?.startsWith(this.config.keyPrefix)) {
          keys.push(key.substring(this.config.keyPrefix.length));
        }
      }
      return keys;
    });
  }
  /**
   * Return a new instance of cache with customized configuration.
   * @param {Object} config - the customized configuration
   * @return {Object} - the new instance of Cache
   */
  createInstance(config) {
    if (!config.keyPrefix || config.keyPrefix === defaultConfig.keyPrefix) {
      logger8.error("invalid keyPrefix, setting keyPrefix with timeStamp");
      config.keyPrefix = getCurrentTime.toString();
    }
    return new _StorageCache(config);
  }
};

// node_modules/@aws-amplify/core/dist/esm/Cache/index.mjs
var Cache = new StorageCache();

// node_modules/@aws-amplify/core/dist/esm/I18n/I18n.mjs
var logger9 = new ConsoleLogger("I18n");
var I18n$1 = class I18n {
  constructor() {
    this._options = null;
    this._lang = null;
    this._dict = {};
  }
  /**
   * Sets the default language from the configuration when required.
   */
  setDefaultLanguage() {
    if (!this._lang && typeof window !== "undefined" && window && window.navigator) {
      this._lang = window.navigator.language;
    }
    logger9.debug(this._lang);
  }
  /**
   * @method
   * Explicitly setting language
   * @param {String} lang
   */
  setLanguage(lang) {
    this._lang = lang;
  }
  /**
   * @method
   * Get value
   * @param {String} key
   * @param {String} defVal - Default value
   */
  get(key, defVal = void 0) {
    this.setDefaultLanguage();
    if (!this._lang) {
      return typeof defVal !== "undefined" ? defVal : key;
    }
    const lang = this._lang;
    let val = this.getByLanguage(key, lang);
    if (val) {
      return val;
    }
    if (lang.indexOf("-") > 0) {
      val = this.getByLanguage(key, lang.split("-")[0]);
    }
    if (val) {
      return val;
    }
    return typeof defVal !== "undefined" ? defVal : key;
  }
  /**
   * @method
   * Get value according to specified language
   * @param {String} key
   * @param {String} language - Specified langurage to be used
   * @param {String} defVal - Default value
   */
  getByLanguage(key, language, defVal = null) {
    if (!language) {
      return defVal;
    }
    const langDict = this._dict[language];
    if (!langDict) {
      return defVal;
    }
    return langDict[key];
  }
  /**
   * @method
   * Add vocabularies for one language
   * @param {String} language - Language of the dictionary
   * @param {Object} vocabularies - Object that has key-value as dictionary entry
   */
  putVocabulariesForLanguage(language, vocabularies) {
    let langDict = this._dict[language];
    if (!langDict) {
      langDict = this._dict[language] = {};
    }
    this._dict[language] = __spreadValues(__spreadValues({}, langDict), vocabularies);
  }
  /**
   * @method
   * Add vocabularies for one language
   * @param {Object} vocabularies - Object that has language as key,
   *                                vocabularies of each language as value
   */
  putVocabularies(vocabularies) {
    Object.keys(vocabularies).forEach((key) => {
      this.putVocabulariesForLanguage(key, vocabularies[key]);
    });
  }
};

// node_modules/@aws-amplify/core/dist/esm/I18n/errorHelpers.mjs
var I18nErrorCode;
(function(I18nErrorCode2) {
  I18nErrorCode2["NotConfigured"] = "NotConfigured";
})(I18nErrorCode || (I18nErrorCode = {}));
var i18nErrorMap = {
  [I18nErrorCode.NotConfigured]: {
    message: "i18n is not configured."
  }
};
var assert4 = createAssertionFunction(i18nErrorMap);

// node_modules/@aws-amplify/core/dist/esm/I18n/index.mjs
var logger10 = new ConsoleLogger("I18n");
var _config = { language: null };
var _i18n = null;
var I18n2 = class _I18n {
  /**
   * @static
   * @method
   * Configure I18n part
   * @param {Object} config - Configuration of the I18n
   */
  static configure(config) {
    logger10.debug("configure I18n");
    if (!config) {
      return _config;
    }
    _config = Object.assign({}, _config, config.I18n || config);
    _I18n.createInstance();
    return _config;
  }
  static getModuleName() {
    return "I18n";
  }
  /**
   * @static
   * @method
   * Create an instance of I18n for the library
   */
  static createInstance() {
    logger10.debug("create I18n instance");
    if (_i18n) {
      return;
    }
    _i18n = new I18n$1();
  }
  /**
   * @static @method
   * Explicitly setting language
   * @param {String} lang
   */
  static setLanguage(lang) {
    _I18n.checkConfig();
    assert4(!!_i18n, I18nErrorCode.NotConfigured);
    _i18n.setLanguage(lang);
  }
  /**
   * @static @method
   * Get value
   * @param {String} key
   * @param {String} defVal - Default value
   */
  static get(key, defVal) {
    if (!_I18n.checkConfig()) {
      return typeof defVal === "undefined" ? key : defVal;
    }
    assert4(!!_i18n, I18nErrorCode.NotConfigured);
    return _i18n.get(key, defVal);
  }
  /**
   * @static
   * @method
   * Add vocabularies for one language
   * @param {String} language - Language of the dictionary
   * @param {Object} vocabularies - Object that has key-value as dictionary entry
   */
  static putVocabulariesForLanguage(language, vocabularies) {
    _I18n.checkConfig();
    assert4(!!_i18n, I18nErrorCode.NotConfigured);
    _i18n.putVocabulariesForLanguage(language, vocabularies);
  }
  /**
   * @static
   * @method
   * Add vocabularies for one language
   * @param {Object} vocabularies - Object that has language as key,
   *                                vocabularies of each language as value
   */
  static putVocabularies(vocabularies) {
    _I18n.checkConfig();
    assert4(!!_i18n, I18nErrorCode.NotConfigured);
    _i18n.putVocabularies(vocabularies);
  }
  static checkConfig() {
    if (!_i18n) {
      _I18n.createInstance();
    }
    return true;
  }
};
I18n2.createInstance();

// node_modules/@aws-amplify/core/dist/esm/awsClients/pinpoint/errorHelpers.mjs
var PinpointValidationErrorCode;
(function(PinpointValidationErrorCode2) {
  PinpointValidationErrorCode2["NoAppId"] = "NoAppId";
})(PinpointValidationErrorCode || (PinpointValidationErrorCode = {}));
var pinpointValidationErrorMap = {
  [PinpointValidationErrorCode.NoAppId]: {
    message: "Missing application id."
  }
};
var assert5 = createAssertionFunction(pinpointValidationErrorMap);

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/utils/getSkewCorrectedDate.mjs
var getSkewCorrectedDate = (systemClockOffset) => new Date(Date.now() + systemClockOffset);

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/utils/isClockSkewed.mjs
var SKEW_WINDOW = 5 * 60 * 1e3;
var isClockSkewed = (clockTimeInMilliseconds, clockOffsetInMilliseconds) => Math.abs(getSkewCorrectedDate(clockOffsetInMilliseconds).getTime() - clockTimeInMilliseconds) >= SKEW_WINDOW;

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/utils/getUpdatedSystemClockOffset.mjs
var getUpdatedSystemClockOffset = (clockTimeInMilliseconds, currentSystemClockOffset) => {
  if (isClockSkewed(clockTimeInMilliseconds, currentSystemClockOffset)) {
    return clockTimeInMilliseconds - Date.now();
  }
  return currentSystemClockOffset;
};

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/middleware.mjs
var signingMiddlewareFactory = ({ credentials, region, service, uriEscapePath = true }) => {
  let currentSystemClockOffset;
  return (next, context) => function signingMiddleware(request) {
    return __async(this, null, function* () {
      currentSystemClockOffset = currentSystemClockOffset ?? 0;
      const signRequestOptions = {
        credentials: typeof credentials === "function" ? yield credentials({
          forceRefresh: !!context?.isCredentialsExpired
        }) : credentials,
        signingDate: getSkewCorrectedDate(currentSystemClockOffset),
        signingRegion: region,
        signingService: service,
        uriEscapePath
      };
      const signedRequest = yield signRequest(request, signRequestOptions);
      const response = yield next(signedRequest);
      const dateString = getDateHeader(response);
      if (dateString) {
        currentSystemClockOffset = getUpdatedSystemClockOffset(Date.parse(dateString), currentSystemClockOffset);
      }
      return response;
    });
  };
};
var getDateHeader = ({ headers } = {}) => headers?.date ?? headers?.Date ?? headers?.["x-amz-date"];

// node_modules/@aws-amplify/core/dist/esm/clients/handlers/aws/authenticated.mjs
var authenticatedHandler = composeTransferHandler(fetchTransferHandler, [
  userAgentMiddlewareFactory,
  amzSdkInvocationIdHeaderMiddlewareFactory,
  retryMiddlewareFactory,
  amzSdkRequestHeaderMiddlewareFactory,
  signingMiddlewareFactory
]);

// node_modules/@aws-amplify/core/dist/esm/clients/middleware/signing/utils/extendedEncodeURIComponent.mjs
var extendedEncodeURIComponent = (uri) => {
  const extendedCharacters = /[!'()*]/g;
  return encodeURIComponent(uri).replace(extendedCharacters, hexEncode2);
};
var hexEncode2 = (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`;

// node_modules/@aws-amplify/core/dist/esm/awsClients/pinpoint/base.mjs
var SERVICE_NAME = "mobiletargeting";
var endpointResolver = ({ region }) => ({
  url: new AmplifyUrl(`https://pinpoint.${region}.${getDnsSuffix(region)}`)
});
var defaultConfig2 = {
  service: SERVICE_NAME,
  endpointResolver,
  retryDecider: getRetryDecider(parseJsonError),
  computeDelay: jitteredBackoff2,
  get userAgentValue() {
    return getAmplifyUserAgent();
  }
};
var getSharedHeaders2 = () => ({
  "content-type": "application/json"
});

// node_modules/@aws-amplify/core/dist/esm/awsClients/pinpoint/updateEndpoint.mjs
var updateEndpointSerializer = ({ ApplicationId = "", EndpointId = "", EndpointRequest }, endpoint) => {
  const headers = getSharedHeaders2();
  const url = new AmplifyUrl(endpoint.url);
  url.pathname = `v1/apps/${extendedEncodeURIComponent(ApplicationId)}/endpoints/${extendedEncodeURIComponent(EndpointId)}`;
  const body = JSON.stringify(EndpointRequest);
  return { method: "PUT", headers, url, body };
};
var updateEndpointDeserializer = (response) => __async(void 0, null, function* () {
  if (response.statusCode >= 300) {
    const error = yield parseJsonError(response);
    throw error;
  } else {
    const { Message, RequestID } = yield parseJsonBody(response);
    return {
      MessageBody: {
        Message,
        RequestID
      },
      $metadata: parseMetadata(response)
    };
  }
});
var updateEndpoint = composeServiceApi(authenticatedHandler, updateEndpointSerializer, updateEndpointDeserializer, defaultConfig2);

// node_modules/@aws-amplify/core/dist/esm/providers/pinpoint/utils/constants.mjs
var FLUSH_INTERVAL = 5 * 1e3;

// node_modules/@aws-amplify/core/dist/esm/awsClients/pinpoint/putEvents.mjs
var putEventsSerializer = ({ ApplicationId, EventsRequest }, endpoint) => {
  assert5(!!ApplicationId, PinpointValidationErrorCode.NoAppId);
  const headers = getSharedHeaders2();
  const url = new AmplifyUrl(endpoint.url);
  url.pathname = `v1/apps/${extendedEncodeURIComponent(ApplicationId)}/events`;
  const body = JSON.stringify(EventsRequest ?? {});
  return { method: "POST", headers, url, body };
};
var putEventsDeserializer = (response) => __async(void 0, null, function* () {
  if (response.statusCode >= 300) {
    const error = yield parseJsonError(response);
    throw error;
  } else {
    const { Results } = yield parseJsonBody(response);
    return {
      EventsResponse: { Results },
      $metadata: parseMetadata(response)
    };
  }
});
var putEvents = composeServiceApi(authenticatedHandler, putEventsSerializer, putEventsDeserializer, defaultConfig2);

// node_modules/@aws-amplify/core/dist/esm/providers/pinpoint/utils/PinpointEventBuffer.mjs
var logger11 = new ConsoleLogger("PinpointEventBuffer");

// node_modules/@aws-amplify/core/dist/esm/providers/pinpoint/types/errors.mjs
var UpdateEndpointException;
(function(UpdateEndpointException2) {
  UpdateEndpointException2["BadRequestException"] = "BadRequestException";
  UpdateEndpointException2["ForbiddenException"] = "ForbiddenException";
  UpdateEndpointException2["InternalServerErrorException"] = "InternalServerErrorException";
  UpdateEndpointException2["MethodNotAllowedException"] = "MethodNotAllowedException";
  UpdateEndpointException2["NotFoundException"] = "NotFoundException";
  UpdateEndpointException2["PayloadTooLargeException"] = "PayloadTooLargeException";
  UpdateEndpointException2["TooManyRequestsException"] = "TooManyRequestsException";
})(UpdateEndpointException || (UpdateEndpointException = {}));

// node_modules/@aws-amplify/core/dist/esm/ServiceWorker/errorHelpers.mjs
var ServiceWorkerErrorCode;
(function(ServiceWorkerErrorCode2) {
  ServiceWorkerErrorCode2["UndefinedInstance"] = "UndefinedInstance";
  ServiceWorkerErrorCode2["UndefinedRegistration"] = "UndefinedRegistration";
  ServiceWorkerErrorCode2["Unavailable"] = "Unavailable";
})(ServiceWorkerErrorCode || (ServiceWorkerErrorCode = {}));
var serviceWorkerErrorMap = {
  [ServiceWorkerErrorCode.UndefinedInstance]: {
    message: "Service Worker instance is undefined."
  },
  [ServiceWorkerErrorCode.UndefinedRegistration]: {
    message: "Service Worker registration is undefined."
  },
  [ServiceWorkerErrorCode.Unavailable]: {
    message: "Service Worker not available."
  }
};
var assert6 = createAssertionFunction(serviceWorkerErrorMap);

export {
  USER_AGENT_HEADER,
  ConsoleLogger,
  AmplifyError,
  AmplifyErrorCode,
  createAssertionFunction,
  AMPLIFY_SYMBOL,
  Hub,
  base64Decoder,
  assertTokenProviderConfig,
  assertOAuthConfig,
  assertIdentityPoolIdConfig,
  decodeJWT,
  isNonRetryableError,
  ADD_OAUTH_LISTENER,
  parseAmplifyConfig,
  Sha256,
  Category,
  ApiAction,
  AuthAction,
  getAmplifyUserAgent,
  Reachability,
  isBrowser,
  Amplify,
  fetchAuthSession2 as fetchAuthSession,
  parseJsonError,
  parseJsonBody,
  composeServiceApi,
  jitteredBackoff2 as jitteredBackoff,
  getRetryDecider,
  retryMiddlewareFactory,
  amplifyUuid,
  userAgentMiddlewareFactory,
  composeTransferHandler,
  fetchTransferHandler,
  unauthenticatedHandler,
  createGetCredentialsForIdentityClient,
  createGetIdClient,
  getDnsSuffix,
  AmplifyUrl,
  AmplifyUrlSearchParams,
  cognitoIdentityPoolEndpointResolver,
  CookieStorage,
  defaultStorage,
  syncSessionStorage,
  signRequest,
  signingMiddlewareFactory,
  NonRetryableError,
  jitteredExponentialRetry,
  urlSafeDecode,
  deDupeAsyncFunction,
  isTokenExpired,
  getDeviceName,
  ApiError,
  base64Encoder,
  WordArray
};
/*! Bundled license information:

@aws-amplify/core/dist/esm/Mutex/Mutex.mjs:
  (*!
   * The MIT License (MIT)
   *
   * Copyright (c) 2016 Christian Speckner <cnspeckn@googlemail.com>
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   *)

js-cookie/dist/js.cookie.mjs:
  (*! js-cookie v3.0.5 | MIT *)
*/
//# sourceMappingURL=chunk-YOSKAYKB.js.map
