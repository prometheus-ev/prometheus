class Pandora::Indexing::Parser::ArachneRecord < Pandora::Indexing::Parser::Record
  def record_id
    record.xpath('.//data')
  end

  def s_keyword
    [record.xpath('.//wwwKunsthistorEinordnung/text()'), record.xpath('.//wwwBeschreibung/text()'), record.xpath('.//wwwMetasuche/text()')]
  end

  def s_credits
    [record.xpath('.//wwwFotodaten/text()'), record.xpath('.//wwwLiteraturangaben/text()')]
  end

  def s_unspecified
    [record.xpath('.//wwwKunsthistorEinordnung/text()'), record.xpath('.//wwwFunktionen/text()')]
  end

  def path
    "Abbildungen/#{record.at_xpath('.//data/text()')}".gsub(/:/, '/')
  end

  def artist
    [""]
  end

  def title
    "#{record.xpath('.//wwwBenennung/text()')}, #{record.xpath('.//Kurzbeschreibung/text()')}".gsub(/\A, /, "").gsub(/, \z/, "")
  end

  def date
    record.xpath('.//wwwDatierung/text()')
  end

  def date_range
    @date_parser.date_range(date.to_s)
  end

  def location
    record.xpath('.//wwwAufbewahrung/text()')
  end

  def discoveryplace
    record.xpath('.//wwwFundort/text()')
  end

  def classification
    record.xpath('.//wwwKunsthistoreinordnung/text()')
  end

  def description
    record.xpath('.//wwwBeschreibung/text()')
  end

  def function
    record.xpath('.//wwwFunktionen/text()')
  end

  def credits
    record.xpath('.//wwwLiteraturangaben/text()')
  end

  def rights_reproduction
    record.xpath('.//wwwFotodaten/text()')
  end
end
