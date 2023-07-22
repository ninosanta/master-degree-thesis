# Validating a Threat Model for Smart Home Gateways


## Abstract
The Internet of Things (IoT) is an interconnected network of devices that communicate and share data with each other over the internet. Among them, Smart Home systems give users the possibility to connect and control, within a residential environment, connected devices like smart bulbs, plugs, sensors, and more.

This master’s thesis focuses on the validation of a threat model that applies to add-ons for Smart Home Gateways that are extensible through add-ons. A Smart Home Gateway is a device, or a software solution, used to control the Smart Home and its smart devices. The Smart Home Gateway investigated in this document is WebThings. It is an open-source project that was incubated at Mozilla for four years and then spun out as an independent project.

The starting point of this work is an already existing threat model that highlights some possible threats that can be introduced into a Smart Home Gateway by add-ons developed for it. To demonstrate that such threats can happen even on WebThings, a set of Proofs of Concept (PoCs) add-ons were produced.  

Moreover, to demonstrate that those PoCs can also be the outcome of an inexperienced or careless programmer, they were validated through two different surveys.  The first one, involves a team of experts, while the second one involves a larger population of users. The goal of the first survey was to evaluate whether the developed Proofs of Concept can reasonably be considered not malicious by design. In this regard, only the PoCs considered reasonable by the experts were then further validated through the second survey. 

Thanks to this second survey, we collected some insights useful to understand whether these malfunctioning inside the developed code were easy to spot and/or consider accidental.
Therefore, the preliminary results confirm that some of the presented threats can occur even if the programmer has no malicious intent.


## Thesis
* [License](LICENSE.md)
* [Compiled version of the thesis](./Thesis/Documents/2023-07-13%20thesis%20-%20santarosa%20-%20final.pdf)
* [Extended abstract of the thesis](./Thesis/Documents/extended-abstract%20-%20santarosa%20-%20final.pdf)
* [PowerPoint presentation of the thesis](./Thesis/Documents/presentazione%20-%20santarosa%20-%20final.pptx)
* [Proofs of Concept presented in the thesis](./PoCs/)