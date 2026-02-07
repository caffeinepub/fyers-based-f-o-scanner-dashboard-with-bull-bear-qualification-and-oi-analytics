import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Timer "mo:core/Timer";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Fyers Credentials Management
  type FyersCreds = {
    clientId : Text;
    secret : Text;
    redirectUrl : Text;
    accessToken : Text;
    refreshToken : Text;
    expiry : Time.Time;
  };

  let credentials = Map.empty<Principal, FyersCreds>();

  public shared ({ caller }) func saveCreds(clientId : Text, secret : Text, redirectUrl : Text, accessToken : Text, refreshToken : Text, expiry : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save credentials");
    };
    let creds = {
      clientId;
      secret;
      redirectUrl;
      accessToken;
      refreshToken;
      expiry;
    };
    credentials.add(caller, creds);
  };

  public shared ({ caller }) func clearCreds() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear credentials");
    };
    credentials.remove(caller);
  };

  public query ({ caller }) func getStatus() : async Text {
    // Allow all users including guests to check status
    // This enables the frontend to show appropriate UI for unauthenticated users
    switch (credentials.get(caller)) {
      case (null) { "NOT_CONNECTED" };
      case (?creds) {
        if (creds.expiry < Time.now() and creds.expiry > 0) {
          "EXPIRED";
        } else {
          "CONNECTED";
        };
      };
    };
  };

  // Symbol List Management (per-user)
  let userSymbolLists = Map.empty<Principal, [Text]>();

  public shared ({ caller }) func saveSymbolList(symbols : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save symbol lists");
    };
    userSymbolLists.add(caller, symbols);
  };

  public query ({ caller }) func getSymbolList() : async ?[Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access symbol lists");
    };
    userSymbolLists.get(caller);
  };

  // Scan Results Types
  type Candle = {
    time : Int;
    open : Float;
    high : Float;
    low : Float;
    close : Float;
    volume : Float;
  };

  type Derivative = {
    symbol : Text;
    side : Side;
    candles : [Candle];
    status : Status;
    atmOiChange : ?Float;
    itmOiChange : [Float];
  };

  type Side = { #long; #short };
  type Status = { #qualified; #disqualified; #ignored };

  module Derivative {
    public func compareBySymbol(d1 : Derivative, d2 : Derivative) : Order.Order {
      d1.symbol.compare(d2.symbol);
    };

    public func isDisqualified(derivative : Derivative) : Bool {
      switch (derivative.status) {
        case (#disqualified) { true };
        case (_) { false };
      };
    };
  };

  type Results = {
    qualified : [Derivative];
    disqualified : [Derivative];
    ignored : [Derivative];
  };

  // Per-user cached results
  type UserScanData = {
    results : Results;
    timestamp : Time.Time;
    lastScanTime : Time.Time;
  };
  let userScanCache = Map.empty<Principal, UserScanData>();
  let userScanInProgress = Map.empty<Principal, Bool>();
  let cacheDuration : Int = 900_000_000_000;

  // Rate limiting: minimum time between scans per user (5 seconds)
  let minScanInterval : Int = 5_000_000_000;

  public shared ({ caller }) func runNewScan() : async Results {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can run scans");
    };

    // Check if user has credentials
    switch (credentials.get(caller)) {
      case (null) {
        Runtime.trap("No Fyers credentials configured. Please connect your account first.");
      };
      case (?creds) {
        if (creds.expiry < Time.now() and creds.expiry > 0) {
          Runtime.trap("Fyers credentials expired. Please reconnect your account.");
        };
      };
    };

    // Check if user has symbol list
    switch (userSymbolLists.get(caller)) {
      case (null) {
        Runtime.trap("No symbol list configured. Please upload a symbol list first.");
      };
      case (_) {};
    };

    // Rate limiting check
    switch (userScanCache.get(caller)) {
      case (?cachedData) {
        let timeSinceLastScan = Time.now() - cachedData.lastScanTime;
        if (timeSinceLastScan < minScanInterval) {
          Runtime.trap("Rate limit: Please wait at least 5 seconds between scans");
        };
      };
      case (null) {};
    };

    // Check if scan already in progress for this user
    switch (userScanInProgress.get(caller)) {
      case (?true) {
        Runtime.trap("Scan already in progress. Please wait.");
      };
      case (_) {};
    };

    userScanInProgress.add(caller, true);

    // Simulate scan logic (placeholder for actual Fyers API integration)
    var bull1 = {
      symbol = "SYM1";
      side = #long;
      candles = [
        {
          time = 0;
          open = 0.0;
          high = 9.0;
          low = 2.0;
          close = 0.0;
          volume = 0.0;
        }
      ];
      status = #qualified;
      atmOiChange = null;
      itmOiChange = [];
    };

    var bear1 = {
      symbol = "SYM2";
      side = #short;
      candles = [
        {
          time = 0;
          open = 0.0;
          high = 14.0;
          low = 3.0;
          close = 0.0;
          volume = 0.0;
        }
      ];
      status = #qualified;
      atmOiChange = null;
      itmOiChange = [];
    };

    let sortedResults : Results = {
      qualified = [bear1];
      disqualified = [bull1];
      ignored = [];
    };

    let now = Time.now();
    let scanData : UserScanData = {
      results = sortedResults;
      timestamp = now;
      lastScanTime = now;
    };

    userScanCache.add(caller, scanData);
    userScanInProgress.add(caller, false);

    sortedResults;
  };

  public query ({ caller }) func getResults() : async ?Results {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access results");
    };

    switch (userScanCache.get(caller)) {
      case (null) { null };
      case (?cachedData) {
        // Check if cache is still valid
        if (Time.now() >= cachedData.timestamp + cacheDuration) {
          null;
        } else {
          ?cachedData.results;
        };
      };
    };
  };

  public query ({ caller }) func getLastScanTimestamp() : async ?Time.Time {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access scan timestamps");
    };

    switch (userScanCache.get(caller)) {
      case (null) { null };
      case (?cachedData) { ?cachedData.lastScanTime };
    };
  };

  // Admin function to clear all caches (maintenance)
  public shared ({ caller }) func clearAllCaches() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can clear all caches");
    };
    // Clear all user caches
    for ((user, _) in userScanCache.entries()) {
      userScanCache.remove(user);
    };
  };
};
