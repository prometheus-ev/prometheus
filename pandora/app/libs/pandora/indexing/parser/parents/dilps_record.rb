class Pandora::Indexing::Parser::Parents::DilpsRecord < Pandora::Indexing::Parser::Record
  def record_id
    record.at_xpath('.//id/text()').to_s.strip
  end

  def artist
    (record.xpath('.//name1/text()') + record.xpath('.//name2/text()')).map { |artist|
      artist.to_s.gsub(/\A; /, '').gsub(/; \z/, '')
    }
  end

  def artist_normalized
    return @artist_normalized if @artist_normalized

    an = artist.map { |a|
      a.to_s.split(', ').reverse.join(' ')
    }

    @artist_normalized = @artist_parser.normalize(an)
  end

  def title
    record.xpath('.//title/text()').map { |title|
      title = title.to_s
      title.slice!("[]")
      title
    }
  end

  def location
    (record.xpath('.//location/text()') + record.xpath('.//institution/text()')).map { |location_term|
      location_term.to_s.strip
    }.delete_if { |location_term|
      location_term.blank?
    }.join(", ")
  end

  def genre
    record.xpath('.//type/text()')
  end

  def institution
    record.xpath('.//institution/text()')
  end

  def isbn
    record.xpath('.//isbn/text()')
  end

  def date
    record.xpath('.//dating/text()').to_s.strip
  end

  def date_range(date)
    @date_range ||= @date_parser.date_range(date)
  end

  def credits
    "#{record.xpath('.//literature/text()')}" +
    " S. #{record.xpath('.//page/text()')}, ".gsub(/ S\. ,/, '') +
    " Abb. #{record.xpath('.//figure/text()')}.".gsub(/ Abb\. \./, '') +
    " Taf. #{record.xpath('.//table/text()')}.".gsub(/ Taf\. \./, '')
  end

  def size
    record.xpath('.//format/text()')
  end

  def material
    record.xpath('.//material/text()')
  end

  def technique
    record.xpath('.//technique/text()')
  end

  def keyword
    record.xpath('.//keyword/text()')
  end

  def addition
    record.xpath('.//addition/text()')
  end

  def annotation
    record.xpath('.//commentary/text()')
  end

  def rights_work
    if @vgbk_parser.is_any_artist_in_vgbk_artists_list?(artist_normalized, date_range)
      @vgbk_parser.rights_work_vgbk
    end
  end

  def rights_reproduction
    record.xpath('.//imagerights/text()')
  end

  protected

  def path_for(name, include_base = false)
    ng = name ? "ng_#{name}" : 'ng'
    path = "#{record.at_xpath(".//#{ng}_img/collectionid/text()")}-#{record.at_xpath('.//imageid/text()').to_s.strip}.jpg"

    base = File.basename(record.at_xpath("#{ng}_img/#{ng}_img_base/base/text()").to_s.tr('\\', '/')) if include_base
    base && base != 'images' ? File.join(base, path) : path
  end
end
