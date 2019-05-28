# Spoiler
Code examples and paper for the Spoiler-Attack

The paper can be found here https://arxiv.org/abs/1903.00446

## Repository content
You can find a demo of the SPOILER-leakage from JS in js_demo. 

## Shared array buffers
We use a counter based on shared array buffers, so make sure they are enabeled before running any tests:

firefox: 
about:config => javascript.options.shared_memory => true

chrome:
chrome://flags/ => shared-array-buffer => true

opera:
chrome://flags/ => shared-array-buffer => true

edge:
status removed
https://www.neowin.net/news/microsoft-mitigates-javascript-vulnerabilities-in-edge-and-internet-explorer
