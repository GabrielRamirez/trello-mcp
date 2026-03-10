export interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  url: string;
  shortUrl: string;
  prefs?: Record<string, unknown>;
  labelNames?: Record<string, string>;
}

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  idList: string;
  idBoard: string;
  pos: number;
  url: string;
  shortUrl: string;
  due: string | null;
  dueComplete: boolean;
  idMembers: string[];
  idLabels: string[];
  labels: TrelloLabel[];
  idChecklists: string[];
  dateLastActivity: string;
}

export interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: string | null;
}

export interface TrelloMember {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
}

export interface TrelloChecklist {
  id: string;
  name: string;
  idBoard: string;
  idCard: string;
  checkItems: TrelloCheckItem[];
}

export interface TrelloCheckItem {
  id: string;
  name: string;
  state: "complete" | "incomplete";
  pos: number;
  idChecklist: string;
}

export interface TrelloAction {
  id: string;
  type: string;
  date: string;
  data: Record<string, unknown>;
  memberCreator?: TrelloMember;
}

export interface TrelloAttachment {
  id: string;
  name: string;
  url: string;
  bytes: number | null;
  date: string;
  mimeType: string | null;
  isUpload: boolean;
  pos: number;
}

export interface TrelloCustomFieldItem {
  id: string;
  idCustomField: string;
  idModel: string;
  modelType: string;
  value: Record<string, string>;
}

export interface TrelloCustomField {
  id: string;
  idModel: string;
  modelType: string;
  name: string;
  type: string;
  fieldGroup: string;
  pos: number;
  options?: TrelloCustomFieldOption[];
}

export interface TrelloCustomFieldOption {
  id: string;
  idCustomField: string;
  value: Record<string, string>;
  pos: number;
  color: string;
}

export interface TrelloOrganization {
  id: string;
  name: string;
  displayName: string;
  desc: string;
  url: string;
  website: string | null;
}

export interface TrelloWebhook {
  id: string;
  description: string;
  idModel: string;
  callbackURL: string;
  active: boolean;
  consecutiveFailures: number;
  firstConsecutiveFailDate: string | null;
}

export interface TrelloNotification {
  id: string;
  type: string;
  date: string;
  unread: boolean;
  data: Record<string, unknown>;
  memberCreator?: TrelloMember;
}

export interface TrelloSearchResult {
  boards: TrelloBoard[];
  cards: TrelloCard[];
}
