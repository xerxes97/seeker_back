interface IMatchItem {
    value: number;
    weight: number;
}

export interface IMatch {
    modality: IMatchItem;
    skills: IMatchItem;
    salary: IMatchItem;
    experience: IMatchItem;
    location: IMatchItem;
}
