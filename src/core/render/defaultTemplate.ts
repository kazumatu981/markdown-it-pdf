export const defaultTemplate = `
<!doctype html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Document</title>
        {{#styles}}
        <link rel="stylesheet" type="text/css" href="{{.}}" />
        {{/styles}}
    </head>
    <body>
        {{{body}}}
    </body>
</html>
`;
