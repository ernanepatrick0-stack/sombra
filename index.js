const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Previne crash de memória na DigitalOcean
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Roda mais leve
            '--disable-gpu'
        ] 
    }
});

// Variável para garantir que ele não fique pedindo vários códigos de uma vez
let codigoSolicitado = false; 

client.on('qr', async (qr) => {
    // Ao invés do QR Code, pedimos o código de 8 dígitos
    if (!codigoSolicitado) {
        try {
            console.log('Solicitando código de pareamento para o WhatsApp...');
            
            // O número vai sem o sinal de + e sem espaços, igual você mandou no print
            const numeroTelefone = '573167582968'; 
            const pairingCode = await client.requestPairingCode(numeroTelefone);
            
            console.log('\n==================================================');
            console.log('🔑 CÓDIGO DE PAREAMENTO DO SOMBRA ✦');
            console.log(`\n       =>  ${pairingCode}  <=\n`);
            console.log('1. Abra o WhatsApp do Sombra no celular');
            console.log('2. Vá em Aparelhos Conectados > Conectar um aparelho');
            console.log('3. Escolha "Conectar usando o número de telefone"');
            console.log('4. Digite esse código acima!');
            console.log('==================================================\n');
            
            codigoSolicitado = true;
        } catch (erro) {
            console.log('Putz, deu erro ao gerar o código:', erro);
        }
    }
});

client.on('ready', () => {
    console.log('Sombra ✦ está online, invisível e operando...');
});

client.on('message', async msg => {
    const linkRegex = /(chat\.whatsapp\.com|whatsapp\.com\/channel)/i;

    if (linkRegex.test(msg.body)) {
        console.log('Alvo detectado! Reportando para o Etzinho...');
        
        try {
            const contact = await msg.getContact();
            
            await client.sendMessage(msg.from, `!executar @${contact.number} (Motivo: Spam de Link)`, {
                mentions: [contact]
            });
        } catch (erro) {
            console.log('Erro ao tentar dedurar o alvo:', erro);
        }
    }
});

client.initialize();
