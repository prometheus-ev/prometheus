class Indexing::Sources::Hamburg < Indexing::Sources::Parents::Hamburg
  def record_id
    @mapping ||= begin
      ids_file = File.open(File.join(Rails.configuration.x.dumps_path, "hamburg_dilps_ids"))
      ids_document = Nokogiri::XML(File.open(ids_file)) do |config|
        config.noblanks
      end

      result = {}
      ids_document.xpath('//objekt').each do |e|
        id = e.xpath('id').text
        dilps_id = e.xpath('dilps_id').text
        if id.present? && dilps_id.present?
          result[id] = dilps_id
        end
      end
      result
    end

    text = "#{record.xpath('ancestor::bilder/easydb4_reference/text()')}"

    if text.blank?
      record.xpath('.//files/file/eas-id/text()')
    else
      current_id = text.sub(/Bilder:/, "")
      @mapping[current_id] || current_id
    end
  end

  def path
    return miro if miro?

    if (full = "#{record.at_xpath('.//files/file/versions/version[@name="full"]/url/text()')}").blank?
      url = "#{record.at_xpath('.//files/file/versions/version[@name="original"]/url/text()')}"
    else
      url = full
    end

    url.sub(/http:\/\/kultdokuhh.fbkultur.uni-hamburg.de\//, '').sub(/http:\/\/localhost\//, '').sub(/https:\/\/kultdokuhh4.fbkultur.uni-hamburg.de\//,'').sub(/https:\/\/kultdokuhh-4.fbkultur.uni-hamburg.de\//,'')
  end

  # künstler
  def artist
    record.xpath('ancestor::bilder/_nested__bilder__kuenstler/bilder__kuenstler/lk_kuenstler_id/kuenstler/name/text()')
  end

  def artist_normalized
    an = artist.map { |a|
      a.to_s.split(', ').reverse.join(' ')
    }
    super(an)
  end

  # titel
  def title
    record.xpath('ancestor::bilder/titel/text()')
  end

  # datierung
  def date
    record.xpath('ancestor::bilder/datum/text()')
  end

  def date_range
    d = date.to_s.strip

    if d == 'um 14886-90'
      d = 'um 1488-90'
    elsif d == '330. n. Chr.'
      d = '330 n. Chr.'
    elsif d == 'um 330. n. Chr.'
      d = 'um 330 n. Chr.'
    elsif d == 'um 1480.'
      d = 'um 1480'
    elsif d == '1361/62 - 64'
      d = '1361 - 64'
    elsif d == '1361/62-64'
      d = '1361 - 64'
    end

    super(d)
  end

  # standort
  def location
    "#{record.xpath('ancestor::bilder/ort_id/ort/name/text()')}, #{record.xpath('ancestor::bilder/institution/text()')}".gsub(/, \z/, '')
  end

  # herstellort
  def manufacture_place
    record.xpath('ancestor::bilder/herstellort_id/ort/name/text()')
  end

  # technik
  def material
    record.xpath('ancestor::bilder/technik_material/text()')
  end

  # Gattung
  def genre
    record.xpath('ancestor::bilder/gattung/text()')
  end

  # Masse
  def size
    record.xpath('ancestor::bilder/masse/text()')
  end

  # abbildungsnachweis
  def credits
    record.xpath('ancestor::bilder/abbildungsnachweis/text()')
  end

  def rights_work
    if is_record_id_a_rights_work_warburg_record_id?
      rights_work_warburg
    elsif is_any_artist_in_vgbk_artists_list?
      rights_work_vgbk
    end
  end

  # copyright
  def rights_reproduction
    record.xpath('ancestor::bilder/copyrightnachweis/text()')
  end

  # Schlagwörter
  def keyword
    record.xpath('ancestor::bilder/darstellung_thema/text()')
  end
end
