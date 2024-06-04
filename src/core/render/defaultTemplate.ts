export const defaultTemplateSource = `
<!doctype html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Document</title>
        {{#hljs}}
        <script src="{{js}}"></script>
        <link rel="stylesheet" type="text/css" href="{{css}}" />
        {{/hljs}}
        {{#styles}}
        <link rel="stylesheet" type="text/css" href="{{.}}" />
        {{/styles}}
    </head>
    <body>
        {{#hljs}}
        <script>hljs.highlightAll();</script>
        {{/hljs}}
        {{{body}}}
    </body>
</html>
`;
