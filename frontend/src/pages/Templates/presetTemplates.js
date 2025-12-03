export const presetLabels = {
  oke: 'Modelo OKE',
}

// Apenas um modelo: OKE (centralizado por tabela wrapper com margin:auto)
export const presetTemplates = {
  oke: ({
    primaryColor = '#0a78ff',
    ctaText = 'Call to Action',
    ctaUrl = '#',
    title = 'Título da sua mensagem',
    p1 = 'Descreva aqui sua oferta e benefícios.',
    p2 = 'Inclua detalhes adicionais, prazos e diferenciais.',
    contentBg = '#ffffff',
  } = {}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;margin:0;">
    <tr><td>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#111;background:${contentBg};border-radius:8px;">
        <tr>
          <td style="padding:0 8px;">
            <div data-slot="hero" style="width:100%;text-align:center;min-height:140px;border:1px dashed #e5e7eb;border-radius:6px;padding:8px;color:#6b7280;">Cole sua imagem de topo aqui</div>
          </td>
        </tr>
        <tr><td style="height:16px;line-height:16px">&nbsp;</td></tr>
        <tr>
          <td style="padding:0 8px;">
            <div style="max-width:560px;margin:0 auto;">
              <div data-gjs-type="text" style="min-height:800px;line-height:1.6;text-align:left;">
                <h2 style="margin:0 0 12px 0;font-size:20px;">${title}</h2>
                <p style="margin:0 0 12px 0;">${p1}</p>
                <p style="margin:0 0 16px 0;">${p2}</p>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px;text-align:center;">
            <a href="${ctaUrl}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;background:${primaryColor};background-color:${primaryColor};border:none;margin:8px auto;">${ctaText}</a>
          </td>
        </tr>
        <tr><td style="height:16px;line-height:16px">&nbsp;</td></tr>
        <tr>
          <td style="padding:0 8px;">
            <div data-slot="footer" style="background:${primaryColor};color:#ffffff;padding:12px;border-radius:6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:4px 0;text-align:center;">Edite este rodapé</td>
                </tr>
                <tr>
          <td style="padding-top:8px;text-align:left;">
                    <div data-slot="footer-icons" style="line-height:0;">
                      <table role="presentation" align="left" cellpadding="0" cellspacing="0" border="0" style="margin:0;line-height:0;">
                        <tr>
                          <td style="line-height:0;">
                            <div data-slot="fi-1" style="min-width:28px;min-height:28px;"></div>
                          </td>
                          <td style="padding-left:16px;line-height:0;">
                            <div data-slot="fi-2" style="min-width:28px;min-height:28px;"></div>
                          </td>
                          <td style="padding-left:16px;line-height:0;">
                            <div data-slot="fi-3" style="min-width:28px;min-height:28px;"></div>
                          </td>
                          <td style="padding-left:16px;line-height:0;">
                            <div data-slot="fi-4" style="min-width:28px;min-height:28px;"></div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
  `,
}

