/* Send plain-HTTP visits to HTTPS. Local previews stay on HTTP. */
if (location.protocol === 'http:' && !/^(localhost|127\.)/.test(location.hostname)) {
  location.replace('https:' + location.href.slice('http:'.length));
}
