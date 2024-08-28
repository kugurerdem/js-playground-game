const
    state = {
        searchText: null,
        quotes: [],
        recentlyClickedId: null,
    },

    init = (quotes) => {
        state.quotes = quotes

        document.getElementById('search').addEventListener(
            'input',
            function (e) {
                state.searchText = this.value
                render()
            }
        )

        render()

        const hash = window.location.hash;
        if (hash) {
            const targetElementId = hash.slice(1) // get rid of #
            document.getElementById(targetElementId).scrollIntoView({ behavior: 'smooth' })
        }
    },

    render = () => {
        document.getElementById('quotes').innerHTML = App()

        document
            .querySelectorAll('.copy-link')
            .forEach(b => b.addEventListener('click', (e) => console.log(e)));
    },

    App = () => `
        ${QuoteList(state.quotes)}
    `,

    QuoteList = (quotes) => {
        return quotes
            .map(({quote, author}, idx) => Quote({
                quote,
                author,
                idx,
            })
        ).join('\n')
    },

    Quote = ({idx, quote, author, source, note}) => {
        const
            hidden = (
                Boolean(state.searchText)
                && !quote.concat(author).includes(state.searchText)
            )
                    ? 'hidden'
                    : '',

            copyText = [quote, author].join('\n\n -'),

            copyTextId = `copy-text-${idx}`,
            copyLinkId = `copy-link-${idx}`,

            copyLink = window.location.host.concat('#' + idx)

        return `
            <blockquote id="${idx}" ${hidden}>
                <p> ${mark(quote, state.searchText)} </p>
                <footer>
                    <span> - ${mark(author, state.searchText)} </span>
                    <span>
                        <button
                            class="copy-text"
                            id="${copyTextId}"
                            data-copy="${copyText}"
                            onclick = "onCopyButtonClick(event)"
                        >
                            ${state.recentlyClickedId == copyTextId
                                ? CheckSvg
                                : CopySvg}
                        </button>
                        <button
                            class="copy-link"
                            id="${copyLinkId}"
                            data-copy="${copyLink}"
                            onclick = "onCopyButtonClick(event)"
                        >
                            ${state.recentlyClickedId == copyLinkId
                                ? CheckSvg
                                : ShareSvg}
                        </button>
                    </span>
                </footer>
            </blockquote>`
    },

    mark = (text, searched) =>
        searched
            ? text.replace(searched, `<mark>${searched}</mark>`)
            : text,

    onCopyButtonClick = (e) => {
        const toCopy = e.currentTarget.getAttribute('data-copy')
        copyToClipboard(toCopy)

        state.recentlyClickedId = e.currentTarget.id
        setTimeout(() => {
            state.recentlyClickedId = null
            render()
        }, 1000)
        render()
    },


    copyToClipboard = (text) => {
        const textarea = document.createElement('textarea');

        textarea.value = text;
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';

        document.body.appendChild(textarea);

        textarea.select();
        document.execCommand('copy');

        document.body.removeChild(textarea);
    },

    CopySvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>
    `,

    ShareSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M400 255.4V240 208c0-8.8-7.2-16-16-16H352 336 289.5c-50.9 0-93.9 33.5-108.3 79.6c-3.3-9.4-5.2-19.8-5.2-31.6c0-61.9 50.1-112 112-112h48 16 32c8.8 0 16-7.2 16-16V80 64.6L506 160 400 255.4zM336 240h16v48c0 17.7 14.3 32 32 32h3.7c7.9 0 15.5-2.9 21.4-8.2l139-125.1c7.6-6.8 11.9-16.5 11.9-26.7s-4.3-19.9-11.9-26.7L409.9 8.9C403.5 3.2 395.3 0 386.7 0C367.5 0 352 15.5 352 34.7V80H336 304 288c-88.4 0-160 71.6-160 160c0 60.4 34.6 99.1 63.9 120.9c5.9 4.4 11.5 8.1 16.7 11.2c4.4 2.7 8.5 4.9 11.9 6.6c3.4 1.7 6.2 3 8.2 3.9c2.2 1 4.6 1.4 7.1 1.4h2.5c9.8 0 17.8-8 17.8-17.8c0-7.8-5.3-14.7-11.6-19.5l0 0c-.4-.3-.7-.5-1.1-.8c-1.7-1.1-3.4-2.5-5-4.1c-.8-.8-1.7-1.6-2.5-2.6s-1.6-1.9-2.4-2.9c-1.8-2.5-3.5-5.3-5-8.5c-2.6-6-4.3-13.3-4.3-22.4c0-36.1 29.3-65.5 65.5-65.5H304h32zM72 32C32.2 32 0 64.2 0 104V440c0 39.8 32.2 72 72 72H408c39.8 0 72-32.2 72-72V376c0-13.3-10.7-24-24-24s-24 10.7-24 24v64c0 13.3-10.7 24-24 24H72c-13.3 0-24-10.7-24-24V104c0-13.3 10.7-24 24-24h64c13.3 0 24-10.7 24-24s-10.7-24-24-24H72z"/></svg>
    `,

    CheckSvg = `
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.2225 1.24213C17.6968 1.73041 17.6968 2.52338 17.2225 3.01166L7.50822 13.0117C7.03389 13.4999 6.26358 13.4999 5.78925 13.0117L0.932103 8.01166C0.457772 7.52338 0.457772 6.73041 0.932103 6.24213C1.40643 5.75385 2.17675 5.75385 2.65108 6.24213L6.65063 10.3554L15.5073 1.24213C15.9817 0.753845 16.752 0.753845 17.2263 1.24213H17.2225Z" fill="#1F883D"/>
        </svg>
    `

window.onload = () => {
    fetch('quotes.json')
        .then(r => r.json())
        .then(init)
}
