export interface Alert {
  id: string; type?: string;
  priority?: number | string;
  title: string; desc?: string;
  action?: string; screen?: string;
}

export interface ActivityEntry {
  id: string; time: string; text: string; type?: string;
}
