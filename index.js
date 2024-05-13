const
    render = () => document.getElementById('quotes').innerHTML = App(),

    App = () => quotes.map(
        ([quote, author], idx) => Quote({quote, author, idx})
    ).join('\n'),

    Quote = ({idx, quote, author}) => `
        <blockquote id="${idx}">
            <p> ${quote} </p>
            <footer> - ${author} </footer>
        </blockquote>
    `

window.onload = render
