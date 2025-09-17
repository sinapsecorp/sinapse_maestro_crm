export const presetLabels = {
  single: '1 coluna (single_column)',
  minimal: 'Minimalista (simple_cta)',
  message: 'Mensagem Simples',
  newsletter: 'Newsletter',
  ecommerce: 'E-commerce',
  welcome: 'Boas-vindas',
}

export const presetTemplates = {
  // 1 coluna: hero com imagem, título, parágrafo e CTA
  single: ({
    hero = 'https://via.placeholder.com/600x220?text=Hero',
    title = 'eBook | Título do eBook',
    desc = 'Texto de apoio curto descrevendo sua oferta ou conteúdo.',
    ctaText = 'Baixar agora',
    ctaUrl = '#',
  } = {}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 0;">
    <tr><td>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111;">
        <tr>
          <td style="padding:0;">
            <img src="${hero}" alt="Hero" style="width:100%;height:auto;display:block;" />
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h1 style="margin:0 0 8px 0;font-size:22px;">${title}</h1>
            <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;">${desc}</p>
            <a href="${ctaUrl}" style="display:inline-block;background:#0a78ff;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-size:14px;">${ctaText}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;font-size:12px;color:#666;border-top:1px solid #eee;">
            Caso não queira mais receber estes e-mails, <a href="#" style="color:#0a78ff;">cancele sua inscrição</a>.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
  `,

  // Minimalista com CTA central
  minimal: ({
    logo = 'https://via.placeholder.com/120x40?text=Logo',
    text = 'Estamos quase lá... Confirme seu e-mail para continuar.',
    ctaText = 'Confirmar e-mail',
    ctaUrl = '#',
  } = {}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 0;">
    <tr><td>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111;text-align:center;">
        <tr><td style="padding:24px 24px 8px 24px;"><img src="${logo}" alt="Logo" style="height:40px;width:auto;display:inline-block;" /></td></tr>
        <tr><td style="padding:8px 24px 16px 24px;"><p style="margin:0;font-size:14px;">${text}</p></td></tr>
        <tr><td style="padding:0 24px 24px 24px;"><a href="${ctaUrl}" style="display:inline-block;background:#0a78ff;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-size:14px;">${ctaText}</a></td></tr>
      </table>
    </td></tr>
  </table>
  `,

  // Mensagem tipo carta com assinatura
  message: ({
    title = 'Olá, {PRIMEIRO_NOME}',
    p1 = 'Mensagem introdutória com o motivo do contato.',
    p2 = 'Mais detalhes e próximos passos para o destinatário.',
    sign = 'https://via.placeholder.com/120x40?text=Assinatura',
  } = {}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 0;">
    <tr><td>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111;">
        <tr><td style="padding:24px;">
          <h2 style="margin:0 0 8px 0;font-size:20px;">${title}</h2>
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;">${p1}</p>
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;">${p2}</p>
          <img src="${sign}" alt="Assinatura" style="margin-top:8px;height:40px;width:auto;display:block;" />
        </td></tr>
      </table>
    </td></tr>
  </table>
  `,

  // Newsletter com hero e 2 colunas
  newsletter: ({
    logo = 'https://via.placeholder.com/120x40?text=Logo',
    hero = 'https://via.placeholder.com/600x200?text=Novidades',
  } = {}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 0;">
    <tr><td>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111;">
        <tr><td style="padding:16px 24px 8px 24px;"><img src="${logo}" alt="Logo" style="height:40px;width:auto;display:block;" /></td></tr>
        <tr><td><img src="${hero}" alt="Banner" style="width:100%;display:block;height:auto;" /></td></tr>
        <tr><td style="padding:16px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="vertical-align:top;padding-right:12px;">
                <img src="https://via.placeholder.com/260x140?text=Item+1" alt="Item 1" style="width:100%;height:auto;border-radius:6px;display:block;margin:0 0 8px 0;" />
                <h3 style="margin:0 0 6px 0;font-size:16px;">Destaque da semana</h3>
                <p style="margin:0;font-size:14px;">Resumo breve do conteúdo principal.</p>
              </td>
              <td width="50%" style="vertical-align:top;padding-left:12px;">
                <img src="https://via.placeholder.com/260x140?text=Item+2" alt="Item 2" style="width:100%;height:auto;border-radius:6px;display:block;margin:0 0 8px 0;" />
                <h3 style="margin:0 0 6px 0;font-size:16px;">Webinar exclusivo</h3>
                <p style="margin:0;font-size:14px;">Chamada rápida para inscrição.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
  `,

  // E-commerce com 3 produtos
  ecommerce: ({
    title = 'Ofertas imperdíveis',
  } = {}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 0;">
    <tr><td>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111;">
        <tr><td style="padding:20px 24px;"><h2 style="margin:0;font-size:20px;">${title}</h2></td></tr>
        <tr><td style="padding:0 16px 16px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${[1,2,3].map(i => `
              <td width="33%" style="vertical-align:top;padding:8px;">
                <img src="https://via.placeholder.com/160x140?text=Produto+${i}" alt="Produto ${i}" style="width:100%;height:auto;border-radius:6px;display:block;margin:0 0 8px 0;" />
                <div style="font-size:14px;margin:0 0 6px 0;">Produto ${i}</div>
                <div style="font-size:14px;color:#0a78ff;margin:0 0 8px 0;">R$ 99,90</div>
                <a href="#" style="display:inline-block;background:#0a78ff;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none;font-size:13px;">Comprar</a>
              </td>`).join('')}
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
  `,

  // Boas-vindas com logo e CTA
  welcome: ({
    logo = 'https://via.placeholder.com/120x40?text=Logo',
    title = 'Receba nossas boas‑vindas!',
    subtitle = 'Estamos felizes por você aqui. Explore os recursos e comece.',
    ctaText = 'Começar agora',
    ctaUrl = '#',
  } = {}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 0;">
    <tr><td>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111;text-align:center;">
        <tr><td style="padding:24px 24px 8px 24px;"><img src="${logo}" alt="Logo" style="height:40px;width:auto;display:inline-block;" /></td></tr>
        <tr><td style="padding:8px 24px 0 24px;"><h1 style="margin:0;font-size:22px;">${title}</h1></td></tr>
        <tr><td style="padding:8px 24px 16px 24px;"><p style="margin:0;font-size:14px;">${subtitle}</p></td></tr>
        <tr><td style="padding:0 24px 24px 24px;"><a href="${ctaUrl}" style="display:inline-block;background:#0a78ff;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-size:14px;">${ctaText}</a></td></tr>
      </table>
    </td></tr>
  </table>
  `,
}


