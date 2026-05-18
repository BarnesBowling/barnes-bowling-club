declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, options?: object);
    loadFromImages(images: string[]): void;
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, callback: (e: any) => void): void;
    flip(page: number): void;
    flipNext(): void;
    flipPrev(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    destroy(): void;
  }
}
