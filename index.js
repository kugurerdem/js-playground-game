const
    state = {
        searchText: null,
    },

    init = () => {
        document.getElementById('search').addEventListener(
            'input',
            function (e) {
                state.searchText = this.value
                render()
            }
        )

        render()
    },

    render = () => {
        document.getElementById('quotes').innerHTML = App()
    },

    App = () => `
        ${QuoteList(quotes)}
    `,

    QuoteList = (quotes) => {
        return quotes
            .filter(([quote, author]) =>
                !Boolean(state.searchText)
                || quote.concat(author).includes(state.searchText)
            )
            .map(([quote, author], idx) => Quote({
                quote,
                author,
                idx,
            })
        ).join('\n')
    },

    Quote = ({idx, quote, author}) => `
        <blockquote id="${idx}">
            <p> ${mark(quote, state.searchText)} </p>
            <footer> - ${mark(author, state.searchText)} </footer>
        </blockquote>
    `,

    mark = (text, searched) =>
        searched
            ? text.replace(searched, `<mark>${searched}</mark>`)
            : text


window.onload = init
