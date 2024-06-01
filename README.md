# transfordev

Playing around with using the llama 3 model for translations. Results aren't very good with translations to other languages, at least for the ones I know. But it was fun building the infra-structure for it.

Every translation is a tiny durable object, most keys are stored in a KV for listing purposes, and a queue is used to issue request to llama 3 for translations.

![img](./Screenshot%202024-06-02%20005057.png)
![img](./Screenshot%202024-06-02%20005120.png)
