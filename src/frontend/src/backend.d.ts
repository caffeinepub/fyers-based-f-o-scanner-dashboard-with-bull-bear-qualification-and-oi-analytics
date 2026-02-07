import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Derivative {
    status: Status;
    side: Side;
    atmOiChange?: number;
    itmOiChange: Array<number>;
    candles: Array<Candle>;
    symbol: string;
}
export type Time = bigint;
export interface Candle {
    low: number;
    high: number;
    close: number;
    open: number;
    time: bigint;
    volume: number;
}
export interface UserProfile {
    name: string;
}
export interface Results {
    disqualified: Array<Derivative>;
    ignored: Array<Derivative>;
    qualified: Array<Derivative>;
}
export interface IndexPerformance {
    name: string;
    changePercent?: number;
}
export enum Side {
    long_ = "long",
    short_ = "short"
}
export enum Status {
    disqualified = "disqualified",
    ignored = "ignored",
    qualified = "qualified"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearAllCaches(): Promise<void>;
    clearCreds(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getIndexPerformance(indexNames: Array<string>): Promise<Array<IndexPerformance>>;
    getLastScanTimestamp(): Promise<Time | null>;
    getResults(): Promise<Results | null>;
    getStatus(): Promise<string>;
    getSymbolList(): Promise<Array<string> | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    runNewScan(): Promise<Results>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCreds(clientId: string, secret: string, redirectUrl: string, accessToken: string, refreshToken: string, expiry: Time): Promise<void>;
    saveSymbolList(symbols: Array<string>): Promise<void>;
}
