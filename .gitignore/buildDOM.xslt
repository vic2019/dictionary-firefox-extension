<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl">
	<xsl:output method="xml" indent="yes"/>
	<xsl:template match="/">
          <table>            
            <xsl:for-each select="entry_list/entry">       
              <tr>
                <span><xsl:value-of select="hw"/></span>
                <span><xsl:value-of select="sound"/></span>
                <span><xsl:value-of select="fl"/></span>
              </tr>
              <tr class="def">
              <xsl:for-each select="def/dt">
                <ul><xsl:value-of select="."/></ul>
                  <xsl:for-each select='vi'>
                	<li><xsl:value-of select="."/></li>
                  </xsl:for-each>
			  </xsl:for-each>
              </tr>                
            </xsl:for-each>
          </table>	
	</xsl:template>
</xsl:stylesheet>