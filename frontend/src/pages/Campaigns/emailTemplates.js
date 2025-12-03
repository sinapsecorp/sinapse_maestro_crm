// Pequena biblioteca de modelos de e-mail em HTML
// Mantém estrutura consistente: header (logo), saudação, parágrafos, botão/CTA e rodapé.

export function defaultEmailTemplate({
  // Slot para LOGO/Hero no topo. Ao anexar a logo, ela ocupará 100% da largura.
  logoUrl = '',
  saudacao = 'Olá,',
  titulo = '',
  paragrafo1 = 'Estamos sempre evoluindo sua experiência com nossos serviços.',
  paragrafo2 = 'Atualizamos itens e condições gerais, de forma transparente.',
  ctaTexto = 'Acessar Termos e Condições',
  ctaUrl = '#',
  observacao = '',
} = {}) {
  const safe = (s) => (s ?? '')
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fff;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;">
          <tr>
            <td style="padding:16px;background:#ffffff;border-radius:12px;">
              <div data-slot="logo" style="width:100%;text-align:center;min-height:120px;">
                ${safe(logoUrl) ? `<img src="${safe(logoUrl)}" alt="Logo" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:8px;"/>` : ''}
              </div>
            </td>
          </tr>
          <tr><td style="height:16px;line-height:16px">&nbsp;</td></tr>
          <tr>
            <td style="padding:0 8px;">
              <h2 style="margin:0 0 12px 0;font-size:18px;">${safe(saudacao)}</h2>
              ${safe(titulo) ? `<p style="margin:0 0 12px 0;font-weight:bold;">${safe(titulo)}</p>` : ''}
              <p style="margin:0 0 12px 0;">${safe(paragrafo1)}</p>
              <p style="margin:0 0 12px 0;">${safe(paragrafo2)}</p>
              ${safe(observacao) ? `<p style="margin:0 0 16px 0;">${safe(observacao)}</p>` : ''}
            </td>
          </tr>
          <tr><td style="height:24px;line-height:24px">&nbsp;</td></tr>
          <tr>
            <td style="padding:16px 8px;color:#6b7280;font-size:12px;border-top:1px solid #eee;">
              <p style="margin:0;">Se você não esperava este e-mail, ignore-o.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `.trim()
}

// Modelo padronizado no estilo "Reservatório de Dopamina"
export function dopamineEmailTemplate({
  headerColor = '#b91c1c',
  headerLogoUrl = '',
  saudacaoNome = 'Olá,',
  introNegrito = 'Toda transformação começa com uma escolha.',
  introComplemento = 'E essa talvez seja a mais importante que você fará este ano.',
  p1 = 'Porque não se trata apenas de falar um novo idioma. Trata-se de ter um sistema que cuida da mente, dos hábitos e da aprendizagem ao mesmo tempo.',
  p2 = 'É unir a neurociência com uma metodologia prática para construir um cérebro focado, constante e capaz de aprender de verdade.',
  p3 = 'O combo reúne tudo: cursos completos, professores, tecnologia de memorização, comunidade, bônus exclusivos e até aulas de conversação ao vivo. Mas atenção: as vendas encerram em 05/09. Depois disso, acabou.',
  ctaTexto = 'QUERO APROVEITAR ANTES QUE ACABE',
  ctaUrl = '#',
  assinaturaTitulo = 'Com entusiasmo,',
  assinaturaNome = 'Seu Reservatório de Dopamina',
  footerBannerUrl = '',
  socialLinks = { instagram: '#', youtube: '#', linkedin: '#', tiktok: '#' },
} = {}) {
  const safe = (s) => (s ?? '')
  const red = headerColor
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#ffffff;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="padding:0;">
              ${safe(headerLogoUrl)
                ? `<img src="${safe(headerLogoUrl)}" alt="Logo" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border:0;" />`
                : `<div style="background:${red};color:#fff;text-align:center;padding:14px 12px;font-weight:700;font-size:18px;border-radius:6px;">Sua Marca</div>`}
              <div data-slot="logo" style="width:100%;text-align:center;min-height:0;"></div>
            </td>
          </tr>
          <tr><td style="height:16px;line-height:16px">&nbsp;</td></tr>
          <!-- Corpo -->
          <tr>
            <td style="padding:0 8px;">
              <p style="margin:0 0 12px 0;">${safe(saudacaoNome)}</p>
              <p style="margin:0 0 12px 0;"><strong>${safe(introNegrito)}</strong> ${safe(introComplemento)}</p>
              <p style="margin:0 0 12px 0;">${safe(p1)}</p>
              <p style="margin:0 0 12px 0;">${safe(p2)}</p>
              <p style="margin:0 0 16px 0;">${safe(p3)}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
                <tr>
                  <td align="center" bgcolor="${red}" style="border-radius:6px;">
                    <a href="${safe(ctaUrl)}" style="display:inline-block;padding:12px 18px;color:#fff;text-decoration:none;font-weight:700;border-radius:6px;background:${red};">${safe(ctaTexto)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px 0;">${safe(assinaturaTitulo)}</p>
              <p style="margin:0 0 24px 0;"><strong>${safe(assinaturaNome)}</strong></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0;">
              ${safe(footerBannerUrl)
                ? `<img src="${safe(footerBannerUrl)}" alt="Banner" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:6px;" />`
                : `<div style="background:${red};color:#fff;text-align:center;padding:18px 12px;border-radius:6px;">Voe alto, seja leve.</div>`}
            </td>
          </tr>
          <tr><td style="height:12px;line-height:12px">&nbsp;</td></tr>
          <tr>
            <td style="padding:0 8px;color:#6b7280;font-size:12px;text-align:center;">
              <a href="${safe(socialLinks.instagram)}" style="margin:0 6px;color:#6b7280;text-decoration:underline;">Instagram</a>
              <a href="${safe(socialLinks.youtube)}" style="margin:0 6px;color:#6b7280;text-decoration:underline;">YouTube</a>
              <a href="${safe(socialLinks.linkedin)}" style="margin:0 6px;color:#6b7280;text-decoration:underline;">LinkedIn</a>
              <a href="${safe(socialLinks.tiktok)}" style="margin:0 6px;color:#6b7280;text-decoration:underline;">TikTok</a>
            </td>
          </tr>
          <tr><td style="height:12px;line-height:12px">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
  `.trim()
}

// Esqueleto simples e totalmente editável (sem cores fixas)
export function skeletonEmailTemplate({
  titulo = 'Título principal',
  paragrafo1 = 'Primeiro parágrafo do seu e-mail. Explique o contexto de forma direta.',
  paragrafo2 = 'Segundo parágrafo com mais detalhes. Você pode adicionar listas, links e imagens.',
  ctaTexto = 'Chamada para ação (opcional)',
  ctaUrl = '#',
} = {}) {
  const safe = (s) => (s ?? '')
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#ffffff;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;">
          <tr>
            <td style="padding:8px 8px 0 8px;">
              <div data-slot="logo" style="width:100%;text-align:center;min-height:80px;">Cole sua LOGO aqui (opcional)</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px;">
              <div data-slot="hero" style="width:100%;text-align:center;min-height:120px;">Cole sua IMAGEM principal aqui (opcional)</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 8px;">
              <h2 style="margin:0 0 12px 0;font-size:20px;">${safe(titulo)}</h2>
              <p style="margin:0 0 12px 0;">${safe(paragrafo1)}</p>
              <p style="margin:0 0 16px 0;">${safe(paragrafo2)}</p>
              <p style="margin:0 0 16px 0;">
                <a href="${safe(ctaUrl)}" style="display:inline-block;padding:12px 18px;text-decoration:none;border:1px solid #d1d5db;border-radius:6px;">${safe(ctaTexto)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px;color:#6b7280;font-size:12px;text-align:center;">
              <div data-slot="rodape" style="min-height:40px;">Rodapé (opcional)</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `.trim()
}

// Modelo OKE: imagem de topo, texto, CTA na cor primária e rodapé na mesma cor
export function okeEditableTemplate({
  primaryColor = '#0a78ff',
  ctaText = 'Quero Minha Anuidade Gratuita',
  ctaUrl = '#',
  titulo = 'Título da sua mensagem',
  paragrafo1 = 'Descreva aqui sua oferta e benefícios.',
  paragrafo2 = 'Inclua detalhes adicionais, prazos e diferenciais.',
  contentBg = '#ffffff',
} = {}) {
  const safe = (s) => (s ?? '')
  const color = primaryColor
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0;padding:24px 0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:${contentBg};border-radius:8px;">
          <!-- HERO (cole sua imagem no bloco abaixo) -->
          <tr>
            <td style="padding:0 8px;">
              <div data-slot="hero" style="width:100%;text-align:center;min-height:140px;border:1px dashed #e5e7eb;border-radius:6px;padding:8px;color:#6b7280;">
                Cole sua imagem de topo aqui (arraste/cole ou use o botão de imagem)
              </div>
            </td>
          </tr>
          <tr><td style="height:16px;line-height:16px">&nbsp;</td></tr>
          <!-- TEXTO LIVRE -->
          <tr>
            <td style="padding:0 8px;">
              <div style="max-width:560px;margin:0 auto;">
                <div style="text-align:left;">
                  <h2 style="margin:0 0 12px 0;font-size:20px;">${safe(titulo)}</h2>
                  <p style="margin:0 0 12px 0;">${safe(paragrafo1)}</p>
                  <p style="margin:0 0 16px 0;">${safe(paragrafo2)}</p>
                </div>
              </div>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:8px;text-align:center;">
              <a href="${safe(ctaUrl)}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;background:${color};background-color:${color};border:none;margin:8px auto;">${safe(ctaText)}</a>
            </td>
          </tr>
          <tr><td style="height:16px;line-height:16px">&nbsp;</td></tr>
          <!-- RODAPÉ EDITÁVEL NA MESMA COR -->
          <tr>
            <td style="padding:0 8px;">
              <div data-slot="footer" style="background:${color};color:#ffffff;padding:12px;border-radius:6px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:4px 0;text-align:center;">
                      Edite este rodapé. Você pode alterar a cor substituindo ${color} por outra no código.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:8px;text-align:right;">
                      <div data-slot="footer-icons" style="line-height:0;">
                        <table role="presentation" align="right" cellpadding="0" cellspacing="0" border="0" style="margin:0;line-height:0;">
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
      </td>
    </tr>
  </table>
  `.trim()
}

export default { defaultEmailTemplate, dopamineEmailTemplate, skeletonEmailTemplate, okeEditableTemplate }


