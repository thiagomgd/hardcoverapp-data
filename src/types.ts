export interface AppState {
  token: string;
  // date when fetched
  ownedFetched: string;
  readFetched: string;
  tbrListsFetched: string;
}

export interface BookInfo {
  tbrLists?: string[];
  editionOwned?: Edition[];
  editionRead?: Edition[];
  title: string;
  author: string;
  image: string;
  link: string;
  rating?: number;
  hasReview: boolean;
}

export interface Edition {
  id: number;
  format: string;
}
