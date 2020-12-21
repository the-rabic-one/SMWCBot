import * as osmosis from 'osmosis';
import Services from '../../services';

export class SMWCentralRomHack {
    private id: number;
    private title: string;
    private date: string;
    private uri: string;
    private demo: boolean;
    private featured: boolean;
    private length: number;
    private rating: number;
    private size: number;
    private authors: string[];
    private difficulty: string;

    constructor(listing: any) {
        this.id = this.convertURIToId(listing['uri']);

        let titleDate = listing['title'].split('\n\t\t\t\t\t\t\t');
        if(titleDate[1]) {
            titleDate[1] = titleDate[1].replace('Added: ', '').trim();
        }
    
        this.title = titleDate[0].trim();
        this.date = titleDate[1].trim();
        this.uri = listing['uri'].trim();
        this.demo = this.getYesNoBooleanValue(listing['demo']);
        this.featured = this.getYesNoBooleanValue(listing['featured']);
        this.length = parseInt(listing['length'].replace(' exit(s)', ''));
        this.rating = parseFloat(listing['rating']);
        this.authors = listing['authors'].split(',').map((s:string) => s.trim());
        this.size = Math.round(parseFloat(listing['size']) * 1024);
        this.difficulty = listing['difficulty'];
    }

    private convertURIToId(uri: string) {
        return parseInt(uri.split('id=')[1]);
    }

    private getYesNoBooleanValue(yesno: string): boolean {
        return yesno.toLowerCase().trim() == 'yes' ? true: false;
    }

    getID(): number { return this.id; }
    getTitle(): string { return this.title; }
    getDate(): string { return this.date; }
    getURI(): string { return 'https://www.smwcentral.net' + this.uri; }
    isDemo(): boolean { return this.demo; }
    isFeatured(): boolean { return this.featured; }
    getLength(): number { return this.length; }
    getRating(): number { return this.rating; }
    getSize(): number { return this.size; }
    getAuthors(): string[] { return this.authors; }
    getDifficulty(): string { return this.difficulty; }

    getDateFormatted(): string {
        let d = new Date(this.date),
            month = '' + (d.getMonth()+1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        if(month.length < 2)
            month = '0' + month;
        if(day.length < 2)
            day = '0' + day;
        
        return [month, day, year].join('/');
    }
}

export interface SMWCentralRomHacks {
    [key: string]: SMWCentralRomHack;
}

export interface SMWCentralRomHackAuthors {
    [key: string]: SMWCentralRomHack[];
}

export interface SMWCentralResult {
    query: string;
    ratio: number;
    author: string | undefined;
    result: SMWCentralRomHack[] | SMWCentralRomHack | undefined;
}

export interface ResponseConfiguration {
    showDate: boolean;
    showLength: boolean;
    showDifficulty: boolean;
}

export function parseSMWCentralResultToString(result: SMWCentralResult, config: ResponseConfiguration): string {
    let ret: string = "";
    if(!result.result) {
        ret = `Could not determine any information for text '${result.query}'.`;
    }

    if(result.result instanceof SMWCentralRomHack) {
        let hack: SMWCentralRomHack = result.result;

        let title = hack.getTitle();
        let author = hack.getAuthors().join(', ')
        let length = hack.getLength();
        let difficulty = hack.getDifficulty();
        let date = hack.getDateFormatted();

        ret = `${title} made by ${author}.`;// This hack was released on ${date}, has ${length} exit(s), and is in the ${difficulty} category.`

        var {showDate, showDifficulty, showLength } = config;

        var count = [showDate, showDifficulty, showLength].filter(Boolean).length;
        var counter = 0;
        if(count) {
            ret += ` This hack `;

            var res = [];
            if(showDate) {
                res.push(`was released on ${date}`);
            }

            if(showLength) {
                res.push(`has ${length} exit(s)`);
            }

            if(showDifficulty) {
                res.push(` is in the ${difficulty} category`);
            }

            ret += res.join(', ').replace(/,(?!.*,)/gmi, ' and');
            ret += `.`;
        }
        return ret;
    } else if (result.result instanceof Array) {
        let hacks: SMWCentralRomHack[] = result.result;
        let titles: string = hacks.map(h => { return h.getTitle(); }).join(', ');
        let author: string | undefined = result.author;

        ret = `${author} has created the following hacks: ${titles}`;
    }

    return ret;
}

export class SMWCentral {
    private updating: boolean = false;
    private ready: boolean = false;
    private lastUpdated: Date | undefined;

    private hacks: SMWCentralRomHacks = {};
    private authors: SMWCentralRomHackAuthors = {};


    private tempHacks: SMWCentralRomHacks = {};
    private  tempAuthors: SMWCentralRomHackAuthors = {};

    isUpdating(): boolean { return this.updating; }
    isReady(): boolean { return this.ready; }
    getLastUpdated(): Date|undefined { return this.lastUpdated; }

    getRomHacks(): SMWCentralRomHacks { return this.hacks; }
    getRomHackAuthors(): SMWCentralRomHackAuthors { return this.authors; }

    refresh() {
        if(!this.updating) {
          //  Services.Logs.info('Starting to pull scrape content from SMWCentral')
            this.updating = true;
            this.scrapePageContent();
        }
    }
    private scrapePageContent(page: number = 1) {
        const targetSMWCentralURL = `https://www.smwcentral.net/?p=section&s=smwhacks&u=0&n=${page}&o=date&d=desc`;



        let totalPages: number = -1;

        osmosis.get(targetSMWCentralURL)
            .find('#menu span:nth-child(3)')
            .set('total') // total number of hacks listed
            .find('#list_content table.generic tr:not(:first-child)')
            .set({
                'title': 'td:nth-child(1)',
                'uri': 'td:nth-child(1) a@href',
                'demo': 'td:nth-child(2)',
                'featured': 'td:nth-child(3)',
                'length': 'td:nth-child(4)',
                'difficulty': 'td:nth-child(5)',
                'authors': 'td:nth-child(6)',
                'rating': 'td:nth-child(7)',
                'size': 'td:nth-child(8)',
                'download': 'td:nth-child(9) a@href'
            })
            .data((listing) => {
                totalPages = Math.ceil(parseInt(listing.total) / 50);
                delete listing.totalPages;

                let hack: SMWCentralRomHack = new SMWCentralRomHack(listing);              
                this.tempHacks[hack.getTitle()] = hack;

                hack.getAuthors().forEach((author) => {
                    if(!this.tempAuthors[author]) {
                        this.tempAuthors[author] = [];
                    }
                    this.tempAuthors[author].push(hack);
                })
            }).done(() => {
                console.log("Finished retrieving page:" + page);
                if(page < totalPages) {
                    this.scrapePageContent(page+1);
                } else {
                    Services.Logs.info(`Finished retrieving all ${totalPages} pages from SMWCentral`);
                    this.hacks = this.tempHacks;
                    this.authors = this.tempAuthors;

                    this.tempHacks = {};
                    this.tempAuthors = {};
                    Services.Logs.info("# of Hacks: " + Object.getOwnPropertyNames(this.hacks).length)
                    Services.Logs.info("# of Authors: " + Object.getOwnPropertyNames(this.authors).length)
                    this.lastUpdated = new Date();
                    this.updating = false;
                }
            });
    }
}