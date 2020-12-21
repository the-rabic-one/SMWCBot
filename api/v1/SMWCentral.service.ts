import { SMWCentralRomHack, SMWCentralRomHackAuthors, SMWCentral, SMWCentralRomHacks, SMWCentralResult } from "./SMWCentral";
import levenshtein from 'js-levenshtein';
import schedule from 'node-schedule';


export class SMWCentralService {
    private smwc: SMWCentral = new SMWCentral();
    
    constructor() {
        this.smwc.refresh();

        schedule.scheduleJob('0 0 * * *', () => { this.smwc.refresh(); })
    }

    queryAllRomHacks = async(): Promise<SMWCentralRomHacks> => {
        return this.smwc.getRomHacks();
    }

    queryAllRomHackAuthors = async(): Promise<SMWCentralRomHackAuthors> => {
        return this.smwc.getRomHackAuthors();
    }

    query(text: string) {
        
        let hacks = this.smwc.getRomHacks();
        let hackResults: LevenshteinResults = this.search(text, Object.getOwnPropertyNames(hacks));

        let results: SMWCentralResult;
        results = { query: text, ratio: -1, result: undefined, author: undefined };
        if(hackResults.ratio >= 0.9) { 
            let name = Object.getOwnPropertyNames(hacks)[hackResults.index];
            results = {
                query: name,
                ratio: hackResults.ratio,
                result: hacks[name],
                author: undefined
            }
        } else {
            let authors = this.smwc.getRomHackAuthors();
            let authorResults: LevenshteinResults = this.search(text, Object.getOwnPropertyNames(authors));
            if(authorResults.ratio >= 0.9) {
                let name = Object.getOwnPropertyNames(authors)[authorResults.index]
                results = {
                    query: name,
                    ratio: authorResults.ratio,
                    result: authors[name],
                    author: name
                }
            }
        }

        return results;
        
    }

    private search(text: string, keys: string[]): LevenshteinResults {
        keys = keys.map(v => v.toLowerCase());

        let bestRatio: number = -1;
        let bestIndex: number = -1;

        if(keys.includes(text)) {
            bestIndex = keys.indexOf(text);
            bestRatio = 1;
        } else {
            for(var i = 0; i < keys.length; i++) {
                let ratio = this.calculateRatio(text, keys[i]);
                if(ratio > bestRatio) {
                    bestRatio = ratio;
                    bestIndex = i;
                }
            }
        }
        
        let results: LevenshteinResults = {
            ratio: bestRatio,
            index: bestIndex
        }

        return results;
    }


    private calculateRatio(text1: string, text2: string) {
        const distance = levenshtein(text1, text2);
        let lengths = text1.length + text2.length;
        return (lengths - distance)/lengths;
    }
}

interface LevenshteinResults {
    ratio: number;
    index: number;
}